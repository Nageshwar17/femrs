// src/components/ui/card.js
import styles from "./card.module.css";

export const Card = ({ children, className = "" }) => {
  return <div className={`${styles.card} ${className}`}>{children}</div>;
};

export const CardContent = ({ children, className = "" }) => {
  return <div className={`${styles.cardContent} ${className}`}>{children}</div>;
};

export const Button = ({ children, onClick, className = "" }) => {
  return (
    <button onClick={onClick} className={`${styles.button} ${className}`}>
      {children}
    </button>
  );
  
};

export default { Card, CardContent, Button };
