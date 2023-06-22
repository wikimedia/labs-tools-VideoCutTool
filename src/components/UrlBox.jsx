import { useState, useRef, useContext, useEffect } from 'react';
import { Message } from '@wikimedia/react.i18n';
import { Form, FormLabel } from 'react-bootstrap';
import { GlobalContext } from '../context/GlobalContext';
import { VideoDetailsContext } from '../context/VideoDetailsContext';
import { checkFileExist } from '../utils/video';

function UrlBox(props) {
	const { updateAppState } = useContext(GlobalContext);
	const { setVideoDetails, setVideoUrl,setFile,setCurrentStep } = useContext(VideoDetailsContext);
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

	const onFileUpload = e => {
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
		setCurrentStep(2);
		setFile(files[0]);
		setVideoUrl(URL.createObjectURL(files[0]));
		setVideoDetails({
			title: files[0].name.replace(/\s/g, '_')
		});
	};

	const dropped = e => {
		e.preventDefault();
		setMouseHover(false);
		onFileUpload(e);
	};

	useEffect(() => {
		setTitle(requiredTitle);
		checkFileExist(requiredTitle, updateAppState,setVideoDetails, setVideoUrl,setCurrentStep,setCurrentStep);
	}, [requiredTitle]);

	const onUrlInput = e => {
		setTitle(e.target.value);
		checkFileExist(e.target.value, updateAppState,setVideoDetails, setVideoUrl,setCurrentStep);
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
