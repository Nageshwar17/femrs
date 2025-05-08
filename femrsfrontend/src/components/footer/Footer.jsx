// components/Footer.jsx
import React from 'react';
import styles from './footer.module.css';
import {
  Mail,
  Phone,
} from 'lucide-react';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.topSection}>
        <div className={styles.brand}>
          <h2>FEMRS</h2>
          <p>Empowering farmers through affordable equipment rentals.</p>
        </div>

        <div className={styles.links}>
          <h4>Quick Links</h4>
          <ul>
            <li><a href="/home">Home</a></li>
            
          </ul>
        </div>

        <div className={styles.contact}>
          <h4>Contact</h4>
          <p>
            <Mail size={16} />
            <a href="mailto:nageswararaonambari2001@gmail.com" className={styles.link}>
                nageswararaonambari2001@gmail.com
            </a>
          </p>
          <p><Phone size={16} /><span>+91 6281271687</span></p>
          
        </div>
      </div>

      <div className={styles.bottomSection}>
        <p> {new Date().getFullYear()} Farming Equipment and Machinery Rental System</p>
      </div>
    </footer>
  );
};

export default Footer;
