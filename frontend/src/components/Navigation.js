import { useState, useEffect } from 'react';
import "../styles/Navigation.css";
import SettingsModal from "./SettingsModal.js";
import AboutModal from "./AboutModal.js";


const  Navigation = () => {

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);

  const toggleSettingsModal = () => setIsSettingsModalOpen(!isSettingsModalOpen);
  const toggleAboutModal = () => setIsAboutModalOpen(!isAboutModalOpen);

  const {
    onOpenSettings,
    onOpenAbout,
  } = window.electron;


  useEffect(() => {
  

    onOpenSettings(toggleSettingsModal);
    onOpenAbout(toggleAboutModal);

 
  }, []);

  return (
    <div>
      <SettingsModal isOpen={isSettingsModalOpen} toggle={toggleSettingsModal}/>
      <AboutModal isOpen={isAboutModalOpen} toggle={toggleAboutModal} />
    </div>
  );
}

export default Navigation;

