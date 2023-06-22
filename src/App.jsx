import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';

import { GlobalContextProvider } from './context/GlobalContext';
import { VideoDetailsProvider } from './context/VideoDetailsContext';
import { UserContextProvider } from './context/UserContext';

import Home from './pages/home';

import 'bootstrap/dist/css/bootstrap.min.css';
import ENV_SETTINGS from './env';

function App() {
	return (
		<div className="container-fluid p-0">
			<GlobalContextProvider>
				<UserContextProvider>
					<VideoDetailsProvider>
						<BrowserRouter>
							<Routes>
								<Route exact path={ENV_SETTINGS().path} element={<Home />} title="VideoCutTool" />
								<Route path={ENV_SETTINGS().not_found_path} element={<Navigate to="/" />} />
							</Routes>
						</BrowserRouter>
					</VideoDetailsProvider>
				</UserContextProvider>
			</GlobalContextProvider>
		</div>
	);
}

export default App;
