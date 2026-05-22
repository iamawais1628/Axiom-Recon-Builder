import re
from datetime import datetime, timedelta

class RuleCondition:
    """Represents a single condition in a rule"""
    
    def __init__(self, field, operator, value):
        self.field = field  # 'bank_amount', 'bank_desc', 'erp_amount', 'erp_desc', 'date_diff'
        self.operator = operator  # '==', '!=', '>', '<', 'contains', 'starts_with', 'in_range'
        self.value = value
    
    def evaluate(self, bank_tx, erp_tx):
        """Evaluate condition against two transactions"""
        field_value = self._get_field_value(bank_tx, erp_tx, self.field)
        
        if self.operator == '==':
            return field_value == self.value
        elif self.operator == '!=':
            return field_value != self.value
        elif self.operator == '>':
            return float(field_value or 0) > float(self.value)
        elif self.operator == '<':
            return float(field_value or 0) < float(self.value)
        elif self.operator == 'contains':
            return self.value.lower() in str(field_value).lower()
        elif self.operator == 'starts_with':
            return str(field_value).lower().startswith(self.value.lower())
        elif self.operator == 'in_range':
            values = self.value.split(',')
            return float(values[0]) <= float(field_value or 0) <= float(values[1])
        elif self.operator == 'regex':
            return bool(re.search(self.value, str(field_value), re.IGNORECASE))
        
        return False
    
    def _get_field_value(self, bank_tx, erp_tx, field):
        """Extract field value from transactions"""
        if field == 'bank_amount':
            return bank_tx.get('amount')
        elif field == 'bank_desc':
            return bank_tx.get('description')
        elif field == 'erp_amount':
            return erp_tx.get('amount')
        elif field == 'erp_desc':
            return erp_tx.get('description')
        elif field == 'amount_diff':
            return abs(bank_tx.get('amount', 0) - erp_tx.get('amount', 0))
        elif field == 'date_diff':
            bank_date = datetime.strptime(bank_tx.get('date', '2024-01-01'), '%Y-%m-%d')
            erp_date = datetime.strptime(erp_tx.get('date', '2024-01-01'), '%Y-%m-%d')
            return abs((bank_date - erp_date).days)
        
        return None

class Rule:
    """Represents a reconciliation rule"""
    
    def __init__(self, rule_id, name, conditions, action, enabled=True):
        self.rule_id = rule_id
        self.name = name
        self.conditions = conditions  # List of RuleCondition objects
        self.action = action  # 'auto_match', 'flag_review', 'skip'
        self.enabled = enabled
        self.logic = 'AND'  # 'AND' or 'OR'
    
    def should_apply(self, bank_tx, erp_tx):
        """Check if rule conditions are met"""
        if not self.enabled:
            return False
        
        if not self.conditions:
            return True
        
        results = [condition.evaluate(bank_tx, erp_tx) for condition in self.conditions]
        
        if self.logic == 'AND':
            return all(results)
        else:  # 'OR'
            return any(results)
    
    def apply(self, bank_tx, erp_tx, confidence):
        """Apply rule action"""
        if self.action == 'auto_match':
            return {
                'action': 'auto_match',
                'confidence': min(100, confidence + 10),  # Boost confidence
                'reason': f'Applied rule: {self.name}'
            }
        elif self.action == 'flag_review':
            return {
                'action': 'flag_review',
                'confidence': confidence,
                'reason': f'Flagged by rule: {self.name}'
            }
        elif self.action == 'skip':
            return {
                'action': 'skip',
                'confidence': confidence,
                'reason': f'Skipped by rule: {self.name}'
            }
        
        return None

class RulesEngine:
    """Main rules engine for reconciliation"""
    
    def __init__(self):
        self.rules = []
    
    def add_rule(self, rule):
        """Add a rule to the engine"""
        self.rules.append(rule)
    
    def evaluate_rules(self, bank_tx, erp_tx, confidence):
        """Evaluate all rules for a match"""
        for rule in self.rules:
            if rule.should_apply(bank_tx, erp_tx):
                return rule.apply(bank_tx, erp_tx, confidence)
        
        return None
    
    def get_applied_rules(self, bank_tx, erp_tx):
        """Get all applicable rules"""
        applied = []
        for rule in self.rules:
            if rule.should_apply(bank_tx, erp_tx):
                applied.append({
                    'rule_id': rule.rule_id,
                    'name': rule.name,
                    'action': rule.action
                })
        return applied

# Pre-built rule templates
RULE_TEMPLATES = {
    'exact_amount_match': {
        'name': 'Exact Amount Match',
        'description': 'Auto-match when amounts are exactly equal',
        'conditions': [
            {'field': 'bank_amount', 'operator': '==', 'value': 'erp_amount'}
        ],
        'action': 'auto_match'
    },
    'within_tolerance': {
        'name': 'Amount Within Tolerance',
        'description': 'Auto-match when difference is less than $1',
        'conditions': [
            {'field': 'amount_diff', 'operator': '<', 'value': '1'}
        ],
        'action': 'auto_match'
    },
    'same_day': {
        'name': 'Same Day Transaction',
        'description': 'Boost confidence for same-day transactions',
        'conditions': [
            {'field': 'date_diff', 'operator': '==', 'value': '0'}
        ],
        'action': 'auto_match'
    },
    'payroll_invoice': {
        'name': 'Payroll Matching',
        'description': 'Auto-match payroll descriptions',
        'conditions': [
            {'field': 'bank_desc', 'operator': 'contains', 'value': 'payroll'},
            {'field': 'erp_desc', 'operator': 'contains', 'value': 'payroll'}
        ],
        'action': 'auto_match'
    },
    'vendor_payment': {
        'name': 'Vendor Payment',
        'description': 'Auto-match vendor/supplier payments',
        'conditions': [
            {'field': 'bank_desc', 'operator': 'contains', 'value': 'vendor'},
            {'field': 'erp_desc', 'operator': 'contains', 'value': 'invoice'}
        ],
        'action': 'auto_match'
    },
    'large_transaction_review': {
        'name': 'Large Transaction Review',
        'description': 'Flag large transactions for manual review',
        'conditions': [
            {'field': 'bank_amount', 'operator': '>', 'value': '10000'}
        ],
        'action': 'flag_review'
    }
}
