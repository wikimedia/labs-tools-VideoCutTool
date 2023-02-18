import React, { useState, useEffect, useContext, useRef } from 'react';
import { Image, Button, OverlayTrigger, Popover, Dropdown } from 'react-bootstrap';
import { Globe2, MenuDown, X } from 'react-bootstrap-icons';
import logo from '../logo.svg';
import { localesList } from '../utils/languages';
import { AppContext } from '../context';
import Authentication from './Authentication';
import DarkModeToggle from './DarkModeToggle';

function Header(props) {
	const { appState, updateAppState } = useContext(AppContext);
	const { user, current_step: currentStep, current_locale: currentLocale } = appState || {};

	const [themeMode, setThemeMode] = useState(localStorage.getItem('theme'));
	const localeName = useRef(false);
	const { apiUrl } = props;

	useEffect(() => {
		if (currentLocale) {
			localeName.current = currentLocale.native_name;
		}
		// Set theme (dark or light) on load
		const theme = localStorage.getItem('theme') || 'light';
		document.body.setAttribute('theme', theme);
	}, [currentLocale]);

	/**
	 * Handle theme toggle between dark and light mode
	 */
	const onThemeSwitch = () => {
		const currentTheme = document.body.getAttribute('theme');
		const newTheme = currentTheme === 'light' ? 'dark' : 'light';

		document.body.setAttribute('theme', newTheme);
		localStorage.setItem('theme', newTheme);
		setThemeMode(newTheme);
	};

	const updateLocaleState = localeObj => {
		localStorage.setItem('localeObj', JSON.stringify(localeObj));
		localeName.current = localeObj.native_name;
		updateAppState({ current_locale: localeObj });
	};

	const closeHeader = () => {
		document.body.setAttribute('data-sidebar', 'hide');
	};

	const localesListPopover = (
		<Popover id="locales-popover">
			<Popover.Header as="h3">Choose your language</Popover.Header>
			<Popover.Body>
				{Object.keys(localesList).map((code, index) => (
					<div
						className={`locale-item ${
							currentLocale && localesList[code].locale === currentLocale.locale && 'active'
						}`}
						title={localesList[code].name}
						value={localesList[code].locale}
						onClick={() => updateLocaleState(localesList[code])}
						key={`locale-${index}`}
					>
						{localesList[code].native_name}
					</div>
				))}
			</Popover.Body>
		</Popover>
	);

	return (
		<div id="sidebar">
			<div className="close-sidebar" onClick={closeHeader}>
				<X />
			</div>
			<div className="logo-wrapper">
				<Image alt="logo" src={logo} width="100" height="40" />
				<h1 className="text-white">VideoCutTool</h1>
			</div>
			<div className="site">
				<div className="darkmode-button-phone">
					<span className="darkmode-switch option-wrapper">
						<DarkModeToggle switchTheme={onThemeSwitch} theme={themeMode} />
					</span>
				</div>
				<div className="site-options-phone">
					<OverlayTrigger trigger="click" rootClose placement="bottom" overlay={localesListPopover}>
						<span
							className="language-switch option-wrapper"
							title={currentLocale && currentLocale.native_name}
						>
							<span className="option-icon">
								<Globe2 />
							</span>
							<span className="option-title">{localeName.current}</span>
						</span>
					</OverlayTrigger>
				</div>
			</div>
			<div className="user-wrapper">
				<Authentication user={user} apiUrl={props.apiUrl} />
				<Dropdown autoClose={false}>
					<Dropdown.Toggle
						variant="secondary"
						style={{ background: 'transparent', border: 'none' }}
						size="sm"
					>
						<MenuDown />
					</Dropdown.Toggle>
					<Dropdown.Menu variant={themeMode === 'dark' && 'dark'}>
						<Dropdown.Item as="button">
							<DarkModeToggle switchTheme={onThemeSwitch} theme={themeMode} />
						</Dropdown.Item>
						<Dropdown.Item as="button">
							<div className="site-options">
								<OverlayTrigger
									trigger="click"
									rootClose
									placement="bottom"
									overlay={localesListPopover}
								>
									<span
										className="language-switch option-wrapper"
										title={currentLocale && currentLocale.native_name}
									>
										<span className="option-icon">
											<Globe2 />
										</span>
										<span className="option-title">{localeName.current}</span>
									</span>
								</OverlayTrigger>
							</div>
						</Dropdown.Item>
						<Dropdown.Item
							href="https://commons.wikimedia.org/wiki/Commons:VideoCutTool"
							target="_blank"
							padding="1em"
						>
							Documentation
						</Dropdown.Item>
					</Dropdown.Menu>
				</Dropdown>
			</div>
			<Button
				variant="outline-secondary"
				className="documentation-btn"
				onClick={() =>
					window.open(
						'https://commons.wikimedia.org/wiki/Commons:VideoCutTool',
						'_blank',
						'noreferrer'
					)
				}
			>
				Documentation
			</Button>
		</div>
	);
}

export default Header;
