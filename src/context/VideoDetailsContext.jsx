import { createContext, useState, useMemo } from 'react';

const VideoDetailsContext = createContext('');

const VideoDetailsProvider = function VideoDetailsProvider(props) {
	const { children } = props;
	const [videos, setVideos] = useState([]);
	const [videoUrl, setVideoUrl] = useState('');
	const [file, setFile] = useState(null);
	const [videoDetails, setVideoDetails] = useState({});
	const [processTime, setProcessTime] = useState('');
	const [currentStep, setCurrentStep] = useState(1);
	const [currentSubStep, setCurrentSubStep] = useState('');
	const contextValue = useMemo(
		() => ({
			videos,
			setVideos,
			videoUrl,
			setVideoUrl,
			file,
			setFile,
			videoDetails,
			setVideoDetails,
			processTime,
			setProcessTime,
			currentStep,
			setCurrentStep,
			currentSubStep,
			setCurrentSubStep
		}),
		[
			videos,
			setVideos,
			videoUrl,
			setVideoUrl,
			file,
			setFile,
			videoDetails,
			setVideoDetails,
			processTime,
			setProcessTime,
			currentStep,
			setCurrentStep,
			currentSubStep,
			setCurrentSubStep
		]
	);
	return (
		<VideoDetailsContext.Provider value={contextValue}>{children}</VideoDetailsContext.Provider>
	);
};
export { VideoDetailsContext, VideoDetailsProvider };
