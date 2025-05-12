import{log} from '../../assets/';

const Projects = () => {
  return (
    <div className="py-32 justify-center items-center" style={{
                    backgroundImage: `url(${log})`, // Path to the image
                    backgroundSize: 'cover', // Makes the image cover the entire element
                    backgroundPosition: 'center', // Centers the image
                    height: 'auto', // Make the container take up the full height of the screen
                    width: '100%', // Full width of the screen
                  }}>
    <p
    className="text-[20px]  text-center 
    md:text-[24px] bg-gradient-to-r  
     from-orange-500 to-yellow-500 bg-clip-text
      text-transparent  font-[cursive] italic tracking-wide ml-2 "
        style={{ fontFamily: 'Garamond, Georgia, serif' }} > New notifications will appear here.
    </p>
    </div>
  );
}


export default Projects;
