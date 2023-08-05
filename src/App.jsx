import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { useEffect } from 'react';

import { GlobalContextProvider } from './context/GlobalContext';
import { VideoDetailsProvider } from './context/VideoDetailsContext';
import { UserContextProvider } from './context/UserContext';

import Home from './pages/home';

import 'bootstrap/dist/css/bootstrap.min.css';
import ENV_SETTINGS from './env';
import { Message } from '@wikimedia/react.i18n';
import VideoSettings from './pages/VideoSettings';
import Results from './pages/Results';

function App() {
	useEffect(() => {
		if (window.performance.navigation.type === 1) {
		  window.location.href = '/';
		}
	  }, []);
	return (
		<div className="container-fluid p-0">
			<GlobalContextProvider>
				<UserContextProvider>
					<VideoDetailsProvider>
						<BrowserRouter>
							<Routes>
								<Route
									exact
									path={ENV_SETTINGS().path}
									element={<Home />}
									title={<Message id="title" />}
								/>
								<Route path="/edit/:videoId" element={<VideoSettings />} />
								<Route path="/upload/:videoId" element={<Results />} />
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
