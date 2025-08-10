import React from 'react';
import PropTypes from 'prop-types';
import { toast } from 'sonner';

export function ShowSubmittedData({ data, title }) {
	const showToast = () => {
		toast.message(title, {
			description: (
                                <pre className="tw-mt-2 tw-w-full tw-overflow-x-auto tw-rounded-md tw-bg-slate-950 tw-p-4">
                                        <code className="tw-text-white">
						{JSON.stringify(data, null, 2)}
					</code>
				</pre>
			),
		});
	};

	return <button onClick={showToast}>Show Submitted Data</button>;
}

ShowSubmittedData.propTypes = {
	data: PropTypes.any.isRequired,
	title: PropTypes.string,
};

ShowSubmittedData.defaultProps = {
	title: 'You submitted the following values:',
};
