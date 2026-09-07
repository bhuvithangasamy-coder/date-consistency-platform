from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models import ValidationRule, AuditLog, User
from backend.app.schemas import RuleResponse, RuleCreate, RuleUpdate
from backend.app.auth import get_current_user, require_role

router = APIRouter(prefix="/rules", tags=["Rule Management"])

@router.get("", response_model=List[RuleResponse])
def get_rules(db: Session = Depends(get_db)):
    rules = db.query(ValidationRule).order_by(ValidationRule.rule_code.asc()).all()
    return rules

@router.get("/{rule_id}", response_model=RuleResponse)
def get_rule_by_id(rule_id: int, db: Session = Depends(get_db)):
    rule = db.query(ValidationRule).filter(ValidationRule.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail=f"Rule {rule_id} not found")
    return rule

@router.post("", response_model=RuleResponse)
def create_rule(
    payload: RuleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["Admin"]))
):
    existing = db.query(ValidationRule).filter(ValidationRule.rule_code == payload.rule_code).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"Rule code {payload.rule_code} already exists")

    rule = ValidationRule(
        rule_code=payload.rule_code,
        name=payload.name,
        description=payload.description,
        source_table=payload.source_table,
        left_field=payload.left_field,
        operator=payload.operator,
        right_field=payload.right_field,
        severity=payload.severity,
        status=payload.status,
        version=payload.version
    )
    db.add(rule)
    db.add(AuditLog(
        user_id=current_user.id,
        username=current_user.username,
        action="Create Rule",
        entity_type="ValidationRule",
        entity_id=payload.rule_code,
        details=f"Created rule {payload.rule_code}: {payload.name}"
    ))
    db.commit()
    db.refresh(rule)
    return rule

@router.put("/{rule_id}", response_model=RuleResponse)
def update_rule(
    rule_id: int,
    payload: RuleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["Admin"]))
):
    rule = db.query(ValidationRule).filter(ValidationRule.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail=f"Rule {rule_id} not found")

    update_data = payload.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(rule, key, value)

    db.add(AuditLog(
        user_id=current_user.id,
        username=current_user.username,
        action="Update Rule",
        entity_type="ValidationRule",
        entity_id=rule.rule_code,
        details=f"Updated rule {rule.rule_code} parameters: {list(update_data.keys())}"
    ))
    db.commit()
    db.refresh(rule)
    return rule

@router.delete("/{rule_id}")
def delete_rule(
    rule_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["Admin"]))
):
    rule = db.query(ValidationRule).filter(ValidationRule.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail=f"Rule {rule_id} not found")

    rule_code = rule.rule_code
    db.delete(rule)
    db.add(AuditLog(
        user_id=current_user.id,
        username=current_user.username,
        action="Delete Rule",
        entity_type="ValidationRule",
        entity_id=rule_code,
        details=f"Deleted rule {rule_code}"
    ))
    db.commit()
    return {"message": f"Rule {rule_code} deleted successfully"}
