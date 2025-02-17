import React, { useState } from 'react';
import Sidebar from './components/Sidebar/Sidebar';
import Main from './components/Main/Main';
import Admin from './components/Admin/Admin';

const App = () => {
    const [showPromptSets, setShowPromptSets] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    const togglePromptSets = () => setShowPromptSets((prev) => !prev);
    const toggleAdmin = () => setIsAdmin((prev) => !prev);

    return (
        <>
            {isAdmin ? (
                <Admin toggleAdmin={toggleAdmin} />
            ) : (
                <>
                    <Sidebar 
                        togglePromptSets={togglePromptSets} 
                        toggleAdmin={toggleAdmin}
                    />
                    <Main showPromptSets={showPromptSets} />
                </>
            )}
        </>
    );
};

export default App;