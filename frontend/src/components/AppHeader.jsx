import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useThemeStyles } from '../utils/themeUtils';
import logo from '../assets/react.svg'; // Changed import to react.svg

function AppHeader() {
  const { theme } = useTheme();
  const styles = useThemeStyles();

  // You might want to conditionally render different header structures
  // based on theme.currentTemplateId if templates have very different layouts.
  // For this example, we'll use the theme styles with a single structure.

  return (
    <header style={{ backgroundColor: styles.headerBg, boxShadow: styles.headerShadow }}>
      {/* Top bar with contact info and social links */}
      <div style={{ color: styles.buttonText, padding: '5px 20px' }}> {/* Assuming buttonText is white/light */}
        <span>📞 1234567890</span>
        <span style={{ marginLeft: '20px' }}>✉️ Info@gmailcom</span>
        <span style={{ marginLeft: '20px' }}>
          <a href="#" style={{ color: styles.buttonText, marginRight: '10px' }}>f Facebook</a>
          <a href="#" style={{ color: styles.buttonText, marginRight: '10px' }}>🐦 Twitter</a>
          <a href="#" style={{ color: styles.buttonText }}>▶️ Youtube</a>
        </span>
      </div>

      {/* Main header with logo and navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 20px', backgroundColor: styles.cardBg }}> {/* Assuming cardBg is white for the lower part */}
        <img src={logo} alt="Tanda Logo" style={{ height: '50px' }} />
        <nav>
          <ul style={{ display: 'flex', listStyle: 'none', margin: 0, padding: 0 }}>
            <li style={{ marginLeft: '20px' }}><a href="#" style={{ color: styles.textColor }}>HOME</a></li>
            <li style={{ marginLeft: '20px' }}><a href="#" style={{ color: styles.textColor }}>ABOUT US</a></li>
            <li style={{ marginLeft: '20px' }}><a href="#" style={{ color: styles.textColor }}>CONTACT US</a></li>
            <li style={{ marginLeft: '20px' }}><a href="#" style={{ color: styles.textColor }}>MY BOOKING</a></li>
            <li style={{ marginLeft: '20px' }}><a href="#" style={{ color: styles.textColor }}>PRODUCTS</a></li>
            <li style={{ marginLeft: '20px' }}><a href="#" style={{ color: styles.textColor }}>ORDERS</a></li>
            <li style={{ marginLeft: '20px' }}><a href="#" style={{ color: styles.textColor }}>🛒 CART</a></li>
          </ul>
        </nav>
        <div>
          <button style={{ ...styles.button, marginRight: '10px' }}>Login</button>
          <button style={styles.button}>English</button>
        </div>
      </div>
    </header>
  );
}

export default AppHeader; 