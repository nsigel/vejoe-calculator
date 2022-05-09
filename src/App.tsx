import "./App.css";
import Form from "./components/Form";

function App() {
	return (
		<div className="flex h-screen w-full bg-joe-dark-blue justify-center items-center">
			<div className="self-start w-full absolute p-4">
				<img
					src="https://traderjoexyz.com/images/192x192_App_Icon.png"
					alt="logo"
					width="48"
				/>
			</div>
			<Form />
		</div>
	);
}

export default App;
