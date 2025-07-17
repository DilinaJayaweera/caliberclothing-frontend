import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';

const NotFound = () => {
  return (
    <div>
      <Header />
      
      <main className="content-container">
        <div className="container">
          <div style={{ 
            textAlign: 'center', 
            padding: '4rem 2rem',
            minHeight: '60vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <h1 style={{ 
              fontSize: '6rem', 
              fontWeight: 'bold', 
              marginBottom: '1rem',
              color: '#000'
            }}>
              404
            </h1>
            
            <h2 style={{ 
              fontSize: '2rem', 
              marginBottom: '1rem',
              color: '#333'
            }}>
              Page Not Found
            </h2>
            
            <p style={{ 
              fontSize: '1.2rem', 
              color: '#666',
              marginBottom: '2rem',
              maxWidth: '500px'
            }}>
              Sorry, the page you are looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
            </p>
            
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <Link to="/" className="btn btn-primary">
                Go to Home
              </Link>
              <Link to="/products" className="btn btn-secondary">
                Browse Products
              </Link>
              <button 
                onClick={() => window.history.back()} 
                className="btn btn-secondary"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default NotFound;