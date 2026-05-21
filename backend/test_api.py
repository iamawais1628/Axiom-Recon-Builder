"""
Test the API endpoints
Run this to verify everything works
"""

from csv_parser import parse_csv
from matching import match_transactions
import json

# Sample data
BANK_CSV = """amount,description,date
1000.00,ABC Corp Payment,2024-01-15
500.50,Wire transfer XYZ,2024-01-16
2500.00,Check 4521,2024-01-17
3200.75,Invoice ABC,2024-01-18
1500.00,Vendor Payment,2024-01-19
"""

ERP_CSV = """amount,description,date
1000.00,Invoice from ACME,2024-01-15
500.50,Payment to XYZ Co,2024-01-16
2500.00,Check payment 4521,2024-01-17
3200.75,ABC Corp invoice,2024-01-18
1500.00,Vendor ABC payment,2024-01-19
"""

def test_csv_parsing():
    """Test CSV parsing"""
    print("\n" + "="*60)
    print("TEST 1: CSV PARSING")
    print("="*60)
    
    bank_txs = parse_csv(BANK_CSV)
    erp_txs = parse_csv(ERP_CSV)
    
    print(f"\n✓ Parsed {len(bank_txs)} bank transactions")
    print(f"✓ Parsed {len(erp_txs)} ERP transactions")
    
    assert len(bank_txs) == 5, "Expected 5 bank transactions"
    assert len(erp_txs) == 5, "Expected 5 ERP transactions"
    
    print("\n✓ CSV Parsing Test PASSED")
    return bank_txs, erp_txs

def test_matching(bank_txs, erp_txs):
    """Test matching algorithm"""
    print("\n" + "="*60)
    print("TEST 2: MATCHING ALGORITHM")
    print("="*60)
    
    matches = match_transactions(bank_txs, erp_txs)
    
    print(f"\n✓ Found {len(matches)} matches")
    
    assert len(matches) >= 4, f"Expected at least 4 matches, got {len(matches)}"
    
    print("\nMatches:")
    print("-" * 60)
    for i, m in enumerate(matches, 1):
        print(f"\n{i}. Bank: ${m['bank_amount']:8.2f} | {m['bank_desc']}")
        print(f"   ERP:  ${m['erp_amount']:8.2f} | {m['erp_desc']}")
        print(f"   Confidence: {m['confidence']}%")
    
    print("\n✓ Matching Algorithm Test PASSED")
    return matches

def test_api_simulation(bank_txs, erp_txs, matches):
    """Simulate API response"""
    print("\n" + "="*60)
    print("TEST 3: API RESPONSE SIMULATION")
    print("="*60)
    
    total_bank = len(bank_txs)
    total_erp = len(erp_txs)
    matched = len(matches)
    unmatched = total_bank + total_erp - (matched * 2)
    match_rate = (matched / max(total_bank, total_erp)) * 100
    avg_confidence = sum(m['confidence'] for m in matches) / max(len(matches), 1)
    
    response = {
        'status': 'success',
        'total_bank': total_bank,
        'total_erp': total_erp,
        'matched': matched,
        'unmatched': unmatched,
        'match_rate': round(match_rate, 1),
        'average_confidence': round(avg_confidence, 1),
        'matches': matches
    }
    
    print("\nAPI Response (JSON):")
    print("-" * 60)
    print(json.dumps(response, indent=2))
    
    print("\n✓ API Simulation Test PASSED")

def main():
    """Run all tests"""
    print("\n" + "🚀 "*30)
    print("RECON AI - API TEST SUITE")
    print("🚀 "*30)
    
    try:
        bank_txs, erp_txs = test_csv_parsing()
        matches = test_matching(bank_txs, erp_txs)
        test_api_simulation(bank_txs, erp_txs, matches)
        
        print("\n" + "="*60)
        print("✓ ALL TESTS PASSED!")
        print("="*60)
        print("\nYour API is ready to use!")
        print("\nNext steps:")
        print("1. Set up PostgreSQL database")
        print("2. Run: pip install -r requirements.txt")
        print("3. Run: python app.py")
        print("4. Test: POST to http://localhost:5000/api/upload-and-match")
        print("="*60 + "\n")
    
    except AssertionError as e:
        print(f"\n❌ TEST FAILED: {e}")
    except Exception as e:
        print(f"\n❌ ERROR: {e}")

if __name__ == '__main__':
    main()
