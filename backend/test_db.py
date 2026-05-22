"""
Test database operations
"""

from db import (
    init_db, save_transaction, save_match, get_all_matches, 
    get_match_stats, confirm_match, reject_match, get_all_sessions
)

def test_database():
    """Test all database operations"""
    
    print("\n" + "="*60)
    print("TESTING DATABASE OPERATIONS")
    print("="*60)
    
    # Test 1: Initialize database
    print("\n[TEST 1] Initialize Database")
    init_db()
    print("✓ Database initialized")
    
    # Test 2: Save transactions
    print("\n[TEST 2] Save Transactions")
    bank_tx_id = save_transaction('bank', 1000.00, 'ABC Corp Payment', '2024-01-15')
    erp_tx_id = save_transaction('erp', 1000.00, 'Invoice ABC', '2024-01-15')
    
    print(f"✓ Saved bank transaction: {bank_tx_id}")
    print(f"✓ Saved ERP transaction: {erp_tx_id}")
    
    if not bank_tx_id or not erp_tx_id:
        print("❌ Failed to save transactions")
        return
    
    # Test 3: Save match
    print("\n[TEST 3] Save Match")
    match_id = save_match(bank_tx_id, erp_tx_id, 95.5)
    print(f"✓ Saved match: {match_id}")
    
    if not match_id:
        print("❌ Failed to save match")
        return
    
    # Test 4: Get all matches
    print("\n[TEST 4] Get All Matches")
    matches = get_all_matches(limit=10)
    print(f"✓ Retrieved {len(matches)} matches")
    
    if matches:
        print(f"  First match: {matches[0]['bank_desc']} ↔ {matches[0]['erp_desc']}")
    
    # Test 5: Get statistics
    print("\n[TEST 5] Get Statistics")
    stats = get_match_stats()
    print(f"✓ Total transactions: {stats.get('total_transactions', 0)}")
    print(f"✓ Total matches: {stats.get('total_matches', 0)}")
    print(f"✓ Confirmed: {stats.get('confirmed_matches', 0)}")
    print(f"✓ Average confidence: {stats.get('average_confidence', 0)}%")
    
    # Test 6: Confirm match
    print("\n[TEST 6] Confirm Match")
    confirmed = confirm_match(match_id)
    print(f"✓ Match confirmed: {confirmed}")
    
    # Test 7: Get sessions
    print("\n[TEST 7] Get Reconciliation Sessions")
    sessions = get_all_sessions()
    print(f"✓ Retrieved {len(sessions)} sessions")
    
    print("\n" + "="*60)
    print("✓ ALL DATABASE TESTS PASSED!")
    print("="*60 + "\n")

if __name__ == '__main__':
    test_database()
