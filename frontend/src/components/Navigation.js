import { useState, useEffect } from 'react';
import "../styles/Navigation.css";
import { useNavigate } from 'react-router-dom';
import SettingsModal from "./SettingsModal.js";


const  Navigation = () => {

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const toggleSettingsModal = () => setIsSettingsModalOpen(!isSettingsModalOpen);

  const {
    onOpenSettings,
    onNavigateToAbout,
    onNavigateToHome,
  } = window.electron;

  const navigate = useNavigate();

  useEffect(() => {
  
    onOpenSettings(toggleSettingsModal);
    onNavigateToAbout(() => navigate('/about'));
    onNavigateToHome(() => navigate('/'));
  
  }, [navigate]);

  return (
    <div>
      <SettingsModal isOpen={isSettingsModalOpen} toggle={toggleSettingsModal}/>
    </div>
  );
}

export default Navigation;

