def match_transactions(bank_txs, erp_txs):
    """
    Find matches between bank and ERP transactions
    
    Returns list of suggested matches
    """
    matches = []
    
    for bank_tx in bank_txs:
        for erp_tx in erp_txs:
            confidence = calculate_confidence(bank_tx, erp_tx)
            
            if confidence >= 70:  # Only suggest if 70%+ confident
                matches.append({
                    'bank_amount': bank_tx['amount'],
                    'bank_desc': bank_tx['description'],
                    'erp_amount': erp_tx['amount'],
                    'erp_desc': erp_tx['description'],
                    'confidence': round(confidence, 1)
                })
    
    # Sort by confidence (highest first)
    matches.sort(key=lambda x: x['confidence'], reverse=True)
    
    return matches

def calculate_confidence(tx1, tx2):
    """
    Calculate confidence score that these transactions match (0-100)
    
    Considers:
    - Amount similarity (0-50 points)
    - Description similarity (0-50 points)
    """
    
    # ===== AMOUNT MATCHING (0-50 points) =====
    amount_diff = abs(tx1['amount'] - tx2['amount'])
    max_amount = max(tx1['amount'], tx2['amount'])
    
    if amount_diff == 0:
        # Exact match
        amount_score = 50
    elif amount_diff <= 1:
        # Within $1
        amount_score = 45
    elif amount_diff / max_amount < 0.01:
        # Within 1%
        amount_score = 40
    elif amount_diff / max_amount < 0.05:
        # Within 5%
        amount_score = 30
    else:
        # Too different
        amount_score = 0
    
    # ===== DESCRIPTION MATCHING (0-50 points) =====
    desc1_lower = tx1['description'].lower()
    desc2_lower = tx2['description'].lower()
    
    # Exact match
    if desc1_lower == desc2_lower:
        desc_score = 50
    else:
        # Split into words
        desc1_words = set(desc1_lower.split())
        desc2_words = set(desc2_lower.split())
        
        # Remove common filler words
        stopwords = {
            'the', 'a', 'an', 'and', 'or', 'to', 'from', 
            'for', 'of', 'in', 'payment', 'invoice', 'by'
        }
        
        desc1_words = desc1_words - stopwords
        desc2_words = desc2_words - stopwords
        
        # Calculate similarity
        if not desc1_words or not desc2_words:
            desc_score = 0
        else:
            common = len(desc1_words & desc2_words)
            total = len(desc1_words | desc2_words)
            desc_score = (common / total) * 50
    
    # ===== TOTAL CONFIDENCE =====
    total = amount_score + desc_score
    return min(100, total)


# Test the matching
if __name__ == '__main__':
    test_bank = [
        {'amount': 100, 'description': 'ACME Corp', 'date': '2024-01-15'},
        {'amount': 500, 'description': 'XYZ Payment', 'date': '2024-01-16'}
    ]
    
    test_erp = [
        {'amount': 100, 'description': 'ACME Corporation', 'date': '2024-01-15'},
        {'amount': 500, 'description': 'XYZ Company', 'date': '2024-01-16'}
    ]
    
    matches = match_transactions(test_bank, test_erp)
    
    print("Testing Matching Algorithm...")
    print(f"\n✓ Found {len(matches)} matches\n")
    
    for m in matches:
        print(f"Match: {m['bank_desc']:20} (${m['bank_amount']:8.2f})")
        print(f"  ↔ {m['erp_desc']:20} (${m['erp_amount']:8.2f})")
        print(f"  Confidence: {m['confidence']}%\n")
