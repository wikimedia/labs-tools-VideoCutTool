import { Message } from '@wikimedia/react.i18n';
import ENV_SETTINGS from '../env';
const { phab_link } = ENV_SETTINGS();
function Footer() {
    return (
        <div className="footer-wrapper">
            <div className="footer">
                © 2019-
                {new Date().getFullYear()}{' '}
                <a
                    target="_blank"
                    rel="noreferrer"
                    href="https://www.mediawiki.org/wiki/User:Gopavasanth"
                >
                    <span>Gopa Vasanth</span>
                </a>
                ,{' '}
                <a
                    target="_blank"
                    rel="noreferrer"
                    href="https://www.mediawiki.org/wiki/User:Sohom_Datta"
                >
                    <span>Sohom Datta</span>
                </a>{' '}
                |{' '}
                <a target="_blank" rel="noreferrer" href={`${phab_link}`}>
                    <span>
                        <Message id="report-issues" />
                    </span>
                </a>{' '}
                |{' '}
                <a
                    target="_blank"
                    rel="noreferrer"
                    href="https://gerrit.wikimedia.org/r/admin/repos/labs/tools/VideoCutTool"
                >
                    <span>
                        <Message id="repository" />
                    </span>
                </a>
            </div>
        </div>
    )
}
export default Footer;