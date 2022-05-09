const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => {
	return (
		<div className="w-full">
			<label
				className="text-gray-500 text-xs font-medium capitalize"
				htmlFor={props.name}
			>
				{props.name}
			</label>
			<input
				placeholder={props.placeholder}
				className="w-full h-8 font-medium bg-joe-dark-blue border border-joe-purple rounded-xs text-white focus:outline-none px-2 text-xs rounded-sm"
				{...props}
			/>
		</div>
	);
};

export default Input;
