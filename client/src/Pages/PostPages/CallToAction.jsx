import{Button} from "flowbite-react"

const CallToAction = () => {

    return (
        <div className=" flex flex-col md:h-1/8 sm:flex-row p-3 border border-teal-500
        justify-center items-center border-rounded-full text-center">
            
                <div className=" flex-1 justify-center flex flex-col">
                    <h1 className="text-1xl font-bold text-center text-teal-500">
                        want to know more about Ronaldo?
                    </h1>
                    <p>
                        check out his latest stats  here
                    </p>
                    <Button gradientDuoTone='purpleToPink'>
                        <a href="https://www.shutterstock.com/image-photo/leipzig-germany-june-18-2024-600nw-2480454921.jpg" target = '_blank'>Click here</a>
                    </Button>
                </div>
                <div className="p-7">
                    <img src="https://www.shutterstock.com/image-photo/leipzig-germany-june-18-2024-600nw-2480454921.jpg" alt="" className=" " />
                </div>
        
        </div>
    )
}


export default CallToAction;