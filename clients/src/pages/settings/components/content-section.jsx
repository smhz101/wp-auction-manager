import PropTypes from 'prop-types';
import { Separator } from '@/components/ui/separator';

export default function ContentSection({ title, desc, children }) {
	return (
		<div className="flex! flex-1! flex-col!">
			<div className="flex-none!">
				<h3 className="text-lg! font-medium!">{title}</h3>
				<p className="text-muted-foreground! text-sm!">{desc}</p>
			</div>
			<Separator className="my-4! flex-none!" />
			<div className="faded-bottom! h-full! w-full! overflow-y-auto! scroll-smooth! pr-4! pb-12!">
				<div className="-mx-1! px-1.5! lg:max-w-xl!">{children}</div>
			</div>
		</div>
	);
}

ContentSection.propTypes = {
	title: PropTypes.string.isRequired,
	desc: PropTypes.string,
	children: PropTypes.node.isRequired,
};
