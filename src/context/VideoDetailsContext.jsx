import { createContext, useState, useMemo } from 'react';

const VideoDetailsContext = createContext('');

const VideoDetailsProvider = function VideoDetailsProvider(props) {
	const { children } = props;
	const [videos, setVideos] = useState([]);
	const [videoUrl, setVideoUrl] = useState('');
	const [file, setFile] = useState(null);
	const [videoDetails, setVideoDetails] = useState({});
	const [processTime, setProcessTime] = useState('');
	const [currentSubStep, setCurrentSubStep] = useState('');
	const [videoId, setVideoId] = useState(null);
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
			currentSubStep,
			setCurrentSubStep,
			videoId,
			setVideoId
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
			currentSubStep,
			setCurrentSubStep, videoId, setVideoId
		]
	);
	return (
		<VideoDetailsContext.Provider value={contextValue}>{children}</VideoDetailsContext.Provider>
	);
};
export { VideoDetailsContext, VideoDetailsProvider };
