import { useState, useRef, useContext, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Message } from '@wikimedia/react.i18n';
import { Form, FormLabel } from 'react-bootstrap';
import { GlobalContext } from '../context/GlobalContext';
import { UserContext } from '../context/UserContext';
import { VideoDetailsContext } from '../context/VideoDetailsContext';
import { checkFileExist, fetchVideoId, fetchViaUrl } from '../utils/video';
import ENV_SETTINGS from '../env';
const API_URL = ENV_SETTINGS().backend_url;

function UrlBox(props) {
	const navigate = useNavigate();
	const { updateAppState } = useContext(GlobalContext);
	const { setVideoDetails, setVideoUrl, setFile, setVideoId, setCurrentSubStep } = useContext(VideoDetailsContext);
	const { currentUser } = useContext(UserContext);
	const { title: requiredTitle } = props;
	const allowedExtensions = 'mp4,webm,mov,flv,ogv';
	const [mouseHover, setMouseHover] = useState(false);
	const [title, setTitle] = useState('');
	const fileUpload = useRef(null);
	const dragEnter = () => {
		setMouseHover(true);
	};

	const dragLeave = () => {
		setMouseHover(false);
	};

	const dragOver = e => {
		e.preventDefault();
	};

	useEffect(() => {
		fetchViaUrl(updateAppState, setVideoDetails, setVideoUrl, setVideoId, navigate, currentUser,setCurrentSubStep);
	}, []);


	const onFileUpload = async (e) => {
		const files = (e.dataTransfer && e.dataTransfer.files) || e.nativeEvent.target.files;
		if (files.length === 0) {
			return;
		}

		const fileExt = files[0].name.split('.').pop().toLowerCase();
		if (allowedExtensions.split(',').indexOf(fileExt) === -1) {
			// eslint-disable-next-line
			alert('File extension not allowed. Currently we allow only ' + allowedExtensions + ' files.');
			return;
		}

		setFile(files[0]);
		const fileurl = URL.createObjectURL(files[0])
		setVideoUrl(fileurl);
		setVideoDetails({
			title: files[0].name.replace(/\s/g, '_')
		});
		await fetchVideoId(
			files[0].name.replace(/\s/g, '_')
			, fileurl, files[0], setVideoId, navigate, currentUser, setCurrentSubStep, updateAppState);

	};

	const dropped = e => {
		e.preventDefault();
		setMouseHover(false);
		onFileUpload(e);
	};

	// Call the function to fetch the UUID

	useEffect(() => {
		setTitle(requiredTitle);
		checkFileExist(requiredTitle, updateAppState, setVideoDetails, setVideoUrl);
	}, [requiredTitle]);

	const onUrlInput = async (e) => {
		setTitle(e.target.value);
		try {
			const result = await checkFileExist(e.target.value, updateAppState, setVideoDetails, setVideoUrl);
			if (result) {
				fetchVideoId(result.title, result.url, null, setVideoId, navigate, currentUser, setCurrentSubStep, updateAppState);
			}
		}
		catch (e) {
			console.log(e);
		}
	};

	return (
		<div id="url-box" data-step-count="1">
			<div
				className="drop-area"
				data-mouseover={mouseHover ? 'true' : 'false'}
				onDragEnter={dragEnter}
				onDragLeave={dragLeave}
				onDragOver={dragOver}
				onDrop={dropped}
			>
				<div className="upload-info-message  mb-3 mb-md-5">
					<Message id="upload-upload-text" />
				</div>
				<FormLabel className="drop-area-click m-0" htmlFor="upload-file-input" ref={fileUpload} />
				<input
					className="d-none"
					ref={fileUpload}
					type="file"
					id="upload-file-input"
					accept={allowedExtensions}
					onChange={onFileUpload}
					autoComplete="on"
				/>
				<Form.Control
					type="text"
					className="upload-url-input w-50"
					placeholder="https://commons.wikimedia.org/wiki/File:video.webm"
					onChange={onUrlInput}
					autoComplete="true"
					value={title}
				/>
			</div>
		</div>
	);
}
export default UrlBox;
