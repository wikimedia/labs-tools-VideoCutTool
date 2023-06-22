import { createContext, useState, useMemo } from 'react';
const UserContext = createContext(null);

const UserContextProvider = ({ children }) => {
	const user = JSON.parse(localStorage.getItem('user')) || null;
	const [currentUser, setCurrentUser] = useState(user);
	const contextValue = useMemo(
		() => ({
			currentUser,
			setCurrentUser
		}),
		[currentUser, setCurrentUser]
	);
	return <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>;
};
export { UserContextProvider, UserContext };
