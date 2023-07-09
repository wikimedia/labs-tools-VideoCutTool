function Slider(props) {
	return (
		<div className="slider">
			<label htmlFor="slider">{props.title}</label>
			<div className="slider-inner">
				<input
					type="range"
					min="0"
					max="100"
					id="slider"
					onChange={props.onChange}
					value={props.value}
				/>
				<span>{props.value}%</span>
			</div>
		</div>
	);
}
export default Slider;
