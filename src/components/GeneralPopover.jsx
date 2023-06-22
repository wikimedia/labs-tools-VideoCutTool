import React from 'react';
import { Popover } from 'react-bootstrap';

/**
 * General purpose popover component, to be used inside OverlayTrigger
 * Not to be used as a standalone component
 *
 * @param {string} id Popover id
 * @param {string} title Popover title
 * @param {string} body Popover body
 *
 * @returns {JSX.Element} Popover component
 */
function GeneralPopover(props) {
	const { id, title, body } = props;
	return (
		<Popover id={id}>
			<Popover.Header as="h3">{title}</Popover.Header>
			<Popover.Body>{body}</Popover.Body>
		</Popover>
	);
}

export default GeneralPopover;
