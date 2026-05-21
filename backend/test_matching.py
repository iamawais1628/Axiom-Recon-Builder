from matching import match_transactions, calculate_confidence

# Test 1: Exact match
def test_exact_match():
    bank = [{'amount': 100, 'description': 'test', 'date': '2024-01-15'}]
    erp = [{'amount': 100, 'description': 'test', 'date': '2024-01-15'}]
    
    matches = match_transactions(bank, erp)
    
    assert len(matches) == 1, f"Expected 1 match, got {len(matches)}"
    assert matches[0]['confidence'] >= 95, f"Confidence too low: {matches[0]['confidence']}"
    print("✓ Test 1 PASS: Exact match detected")

# Test 2: Similar description
def test_similar_description():
    bank = [{'amount': 100, 'description': 'ACME Corp payment', 'date': '2024-01-15'}]
    erp = [{'amount': 100, 'description': 'ACME Corporation invoice', 'date': '2024-01-15'}]
    
    matches = match_transactions(bank, erp)
    
    assert len(matches) == 1, f"Expected 1 match, got {len(matches)}"
    assert matches[0]['confidence'] >= 75, f"Confidence too low: {matches[0]['confidence']}"
    print("✓ Test 2 PASS: Similar description matched")

# Test 3: Different amounts (no match)
def test_different_amounts():
    bank = [{'amount': 100, 'description': 'test', 'date': '2024-01-15'}]
    erp = [{'amount': 5000, 'description': 'test', 'date': '2024-01-15'}]
    
    matches = match_transactions(bank, erp)
    
    assert len(matches) == 0, f"Expected 0 matches, got {len(matches)}"
    print("✓ Test 3 PASS: Different amounts not matched")

# Test 4: Low confidence (no match)
def test_low_confidence():
    bank = [{'amount': 100, 'description': 'xyz', 'date': '2024-01-15'}]
    erp = [{'amount': 200, 'description': 'abc', 'date': '2024-01-15'}]
    
    matches = match_transactions(bank, erp)
    
    assert len(matches) == 0, f"Expected 0 matches, got {len(matches)}"
    print("✓ Test 4 PASS: Low confidence not matched")

# Test 5: Multiple transactions
def test_multiple():
    bank = [
        {'amount': 1000, 'description': 'ABC Corp', 'date': '2024-01-15'},
        {'amount': 500, 'description': 'XYZ Inc', 'date': '2024-01-16'}
    ]
    
    erp = [
        {'amount': 1000, 'description': 'ABC Corp', 'date': '2024-01-15'},
        {'amount': 500, 'description': 'XYZ Company', 'date': '2024-01-16'}
    ]
    
    matches = match_transactions(bank, erp)
    
    assert len(matches) == 2, f"Expected 2 matches, got {len(matches)}"
    print("✓ Test 5 PASS: Multiple transactions matched")

# Run all tests
if __name__ == '__main__':
    print("Running matching algorithm tests...\n")
    
    try:
        test_exact_match()
        test_similar_description()
        test_different_amounts()
        test_low_confidence()
        test_multiple()
        
        print("\n" + "="*50)
        print("✓ ALL TESTS PASSED!")
        print("="*50)
    
    except AssertionError as e:
        print(f"\n❌ TEST FAILED: {e}")
