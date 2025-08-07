import React from 'react';
import PropTypes from 'prop-types';
import { toast } from 'sonner';

export function ShowSubmittedData({ data, title }) {
	const showToast = () => {
		toast.message(title, {
			description: (
				<pre className="mt-2 w-full overflow-x-auto rounded-md bg-slate-950 p-4">
					<code className="text-white">
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
