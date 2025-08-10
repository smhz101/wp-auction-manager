import PropTypes from 'prop-types';
import { Separator } from '@/components/ui/separator';

export default function ContentSection({ title, desc, children }) {
	return (
                <div className="tw-flex! tw-flex-1! tw-flex-col!">
                        <div className="tw-flex-none!">
                                {title && <h3 className="tw-text-lg! tw-font-medium!">{title}</h3>}
                                {desc && (
                                        <p className="tw-text-muted-foreground! tw-text-sm!">{desc}</p>
                                )}
                        </div>
                        {title && desc && <Separator className="!tw-my-4 !tw-flex-none" />}
                        <div className="faded-bottom! tw-h-full! tw-w-full! tw-overflow-y-auto! tw-scroll-smooth! tw-pr-4! tw-pb-12!">
                                <div className="tw--mx-1! tw-px-1.5! lg:tw-max-w-xl!">{children}</div>
                        </div>
                </div>
	);
}

ContentSection.propTypes = {
	title: PropTypes.string,
	desc: PropTypes.string,
	children: PropTypes.node.isRequired,
};
