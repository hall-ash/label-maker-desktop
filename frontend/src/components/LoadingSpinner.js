import "../styles/LoadingSpinner.css";
import { DNA } from 'react-loader-spinner';


const LoadingSpinner = () => {
  

  return (
      <div className="LoadingSpinner">
      	<p>Creating Labels...</p>
        <DNA
		  visible={true}
		  height="80"
		  width="80"
		  ariaLabel="dna-loading"
		  wrapperStyle={{}}
		  wrapperClass="dna-wrapper"
		  />
      </div>
  );
}

export default LoadingSpinner;