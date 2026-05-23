from difflib import SequenceMatcher
import re

def normalize_string(s):
    """Normalize string for comparison"""
    if not s:
        return ""
    s = str(s).lower().strip()
    s = re.sub(r'[^\w\s]', '', s)  # Remove special characters
    s = ' '.join(s.split())  # Remove extra spaces
    return s

def string_similarity(a, b):
    """Calculate similarity between two strings (0-100)"""
    a = normalize_string(a)
    b = normalize_string(b)
    
    if not a and not b:
        return 100
    if not a or not b:
        return 0
    
    ratio = SequenceMatcher(None, a, b).ratio()
    return round(ratio * 100, 1)

def amount_match(amount1, amount2, tolerance=0.01):
    """Check if amounts match within tolerance"""
    try:
        amt1 = float(amount1)
        amt2 = float(amount2)
        
        # Exact match
        if amt1 == amt2:
            return True
        
        # Close match (within tolerance %)
        diff_percent = abs(amt1 - amt2) / max(amt1, amt2) * 100
        return diff_percent <= tolerance
    except:
        return False

def match_transactions(bank_txs, erp_txs):
    """
    Match bank transactions with ERP transactions
    Returns list of matched pairs with confidence scores
    """
    matches = []
    matched_bank_ids = set()
    matched_erp_ids = set()
    
    # Try to match each bank transaction with ERP transactions
    for bank_tx in bank_txs:
        best_match = None
        best_confidence = 0
        
        for erp_tx in erp_txs:
            # Skip if already matched
            if erp_tx['id'] in matched_erp_ids:
                continue
            
            # Check amount match
            if not amount_match(bank_tx['amount'], erp_tx['amount']):
                continue
            
            # Calculate description similarity
            desc_similarity = string_similarity(
                bank_tx['description'], 
                erp_tx['description']
            )
            
            # Calculate date match (prefer same dates)
            date_match = 0
            try:
                if str(bank_tx['date']) == str(erp_tx['date']):
                    date_match = 20  # Boost if dates match
            except:
                pass
            
            # Combined confidence score
            confidence = (desc_similarity * 0.7) + date_match
            
            # Only consider matches with >40% confidence
            if confidence > 40 and confidence > best_confidence:
                best_confidence = confidence
                best_match = {
                    'bank_id': bank_tx['id'],
                    'erp_id': erp_tx['id'],
                    'bank_amount': float(bank_tx['amount']),
                    'bank_desc': bank_tx['description'],
                    'erp_amount': float(erp_tx['amount']),
                    'erp_desc': erp_tx['description'],
                    'confidence': round(best_confidence, 1),
                    'match_type': 'fuzzy' if confidence < 100 else 'exact'
                }
        
        # Add best match if found
        if best_match and best_confidence > 40:
            matches.append(best_match)
            matched_bank_ids.add(bank_tx['id'])
            matched_erp_ids.add(best_match['erp_id'])
    
    # Sort by confidence (highest first)
    matches.sort(key=lambda x: x['confidence'], reverse=True)
    
    return matches

def get_match_quality(matches):
    """Get quality metrics for matches"""
    if not matches:
        return {
            'total_matches': 0,
            'high_confidence': 0,
            'medium_confidence': 0,
            'low_confidence': 0,
            'average_confidence': 0
        }
    
    high = sum(1 for m in matches if m['confidence'] >= 90)
    medium = sum(1 for m in matches if 70 <= m['confidence'] < 90)
    low = sum(1 for m in matches if m['confidence'] < 70)
    
    avg_conf = sum(m['confidence'] for m in matches) / len(matches) if matches else 0
    
    return {
        'total_matches': len(matches),
        'high_confidence': high,
        'medium_confidence': medium,
        'low_confidence': low,
        'average_confidence': round(avg_conf, 1)
    }
