import { useState } from 'react';
import axios from 'axios';
import { isValidStellarAddress } from './utils/validateStellarAddress';

function App() {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('');

  const createAccount = async () => {
    try {
      const { data } = await axios.post('/api/stellar/account/create');
      setAccount(data);
      setStatus('Account created! Save your secret key securely.');
    } catch (error) {
      setStatus('Error: ' + error.message);
    }
  };

  const checkBalance = async () => {
    if (!account) return;
    try {
      const { data } = await axios.get(`/api/stellar/account/${account.publicKey}`);
      setBalance(data);
    } catch (error) {
      setStatus('Error: ' + error.message);
    }
  };

  const recipientValid = isValidStellarAddress(recipient);
  const recipientTouched = recipient.length > 0;

  const sendPayment = async () => {
    if (!account || !recipientValid || !amount) return;
    try {
      const { data } = await axios.post('/api/stellar/payment/send', {
        sourceSecret: account.secretKey,
        destination: recipient,
        amount,
        assetCode: 'XLM'
      });
      setStatus(`Payment sent! Hash: ${data.hash}`);
      checkBalance();
    } catch (error) {
      setStatus('Error: ' + error.message);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Stellar Remittance Platform</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button onClick={createAccount}>Create Account</button>
        {account && (
          <div style={{ marginTop: '10px', padding: '10px', background: '#f0f0f0' }}>
            <p><strong>Public Key:</strong> {account.publicKey}</p>
            <p><strong>Secret Key:</strong> {account.secretKey}</p>
          </div>
        )}
      </div>

      {account && (
        <>
          <div style={{ marginBottom: '20px' }}>
            <button onClick={checkBalance}>Check Balance</button>
            {balance && (
              <div style={{ marginTop: '10px' }}>
                {balance.balances.map((b, i) => (
                  <p key={i}>{b.asset}: {b.balance}</p>
                ))}
              </div>
            )}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h3>Send Payment</h3>
            <div style={{ position: 'relative', marginBottom: '4px' }}>
              <input
                type="text"
                placeholder="Recipient Public Key"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  boxSizing: 'border-box',
                  border: `2px solid ${recipientTouched ? (recipientValid ? '#22c55e' : '#ef4444') : '#ccc'}`,
                  borderRadius: '4px',
                  outline: 'none',
                }}
              />
              {recipientTouched && (
                <span style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }}>
                  {recipientValid ? '✅' : '❌'}
                </span>
              )}
            </div>
            {recipientTouched && !recipientValid && (
              <p style={{ color: '#ef4444', fontSize: '13px', margin: '0 0 10px' }}>
                Invalid Stellar address format (must start with G and be 56 characters)
              </p>
            )}
            <input
              type="number"
              placeholder="Amount (XLM)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{ width: '100%', marginBottom: '10px', padding: '8px' }}
            />
            <button onClick={sendPayment} disabled={!recipientValid || !amount}>Send</button>
          </div>
        </>
      )}

      {status && (
        <div style={{ padding: '10px', background: '#e8f4f8', marginTop: '20px' }}>
          {status}
        </div>
      )}
    </div>
  );
}

export default App;
