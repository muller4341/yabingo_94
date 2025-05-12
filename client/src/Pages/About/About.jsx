import {muller} from '../../assets'
import { log } from '../../assets';
import { lottery } from '../../assets';

const About = () => {

    return (  
        <div className=" md:py-20 py-28 w-100% px-4" style={{
                backgroundImage: `url(${log})`, // Path to the image
                backgroundSize: 'cover', // Makes the image cover the entire element
                backgroundPosition: 'center', // Centers the image
                height: 'auto', // Make the container take up the full height of the screen
                width: '100%', // Full width of the screen
              }}>
           <h1 className="text-[16px] font-bold text-center 
           md:text-[20px] text-fuchsia-900 "
               style={{ fontFamily: 'Garamond, Georgia, serif' }}>About this page </h1>
               <div className='flex flex-col  py-4 px-4 border-b border-gray-500 justify-center items-center'>

                <img src= {lottery} alt='muller ' className='w-40 h-[260PX] md:w-60 md:h-[300px]
                border rounded-md ' />
                <div>
                <p className="text-[10px]  text-center 
           md:text-[16px] bg-gradient-to-r  
            from-orange-500 to-yellow-500 bg-clip-text
             text-transparent  font-[cursive] italic tracking-wide ml-2 "
               style={{ fontFamily: 'Garamond, Georgia, serif' }}> Treasur Hunt</p>
                
                </div>
               </div>
               <div className=' py-2 px-2 md:px-28 py-10'>

                <p className='font-bold md:text-[24px] text-[18px] md:py-4 py-2'>🪙 About Treasure Hunt</p>
                <p className=' md:text-[18px] text-[16px] py-1'>
                Welcome to the CBE Treasure Hunt — an exciting digital adventure brought to you by the Commercial Bank of Ethiopia! This game is designed for our valued clients who are ready to take on challenges, have fun, and stand a chance to win exclusive rewards.

Participants must complete 10 unique tasks posted by our admin team. Each task is a step closer to unlocking your lucky number — your personal ticket to becoming one of our lucky winners. Whether it’s uploading media, answering questions, or interacting with our digital platforms, each task brings you closer to the treasure.
                </p>
                
                <div>
                <p className='font-bold md:text-[24px] text-[18px] md:py-4 py-2'>
                🎁 What We Offer
                </p>
                <p className='f md:text-[18px] text-[14px] py-1 px-2 md:px-4'>
                <span className='font-semibold'>Exciting Challenges:</span>  Fun and engaging tasks that test your creativity and commitment.
                </p>
                <p className=' md:text-[18px] text-[14px] py-1 px-2 md:px-4'>
               <span className='font-semibold'> Lucky Numbers: </span> Earn a special lucky number after completing all 10 tasks — only lucky ones will be selected for rewards!
                </p>
                <p className=' md:text-[18px] text-[14px] py-1 px-2 md:px-4'>
               <span className='font-semibold' >Exclusive Rewards:</span> Winners will receive valuable prizes as a thank-you for your participation and engagement.
                </p>
                </div>
                <div>
                    <p className='font-bold md:text-[24px] text-[18px] md:py-4 py-2'>🤝 Join Our Community</p>
                    <p className=' md:text-[18px] text-[14px] py-1'>Ready to begin your treasure hunt? Join a growing community of participants who are exploring, engaging, and earning with CBE.

Here’s how to get started:</p>
                    <p className=' md:text-[18px] text-[14px] py-1 px-2 md:px-4'>
                    <span className='font-semibold'>1.</span> Sign up with your valid phone number.
                    </p>
                    <p className=' md:text-[18px] text-[14px] py-1 px-2 md:px-4'>
                    <span className='font-semibold'>2.</span> Complete 10 tasks shared by our admin team.
                    </p >
                    <p className=' md:text-[18px] text-[14px] py-1 px-2 md:px-4'>
                        <span className='font-semibold'>3</span> Receive your lucky number upon successful completion.</p>
                        <p className=' md:text-[18px] text-[14px] py-1 px-2 md:px-4'>
                        <span className='font-semibold'>4</span> Wait for the announcement — you could be one of the lucky winners!</p>
                
                
                <p className=' md:text-[18px] text-[16px] py-1'>
                Stay motivated, stay consistent, and let your luck shine through. Join us today and let the hunt begin!




                </p>
                </div>

               </div>

            
        </div>
    );
}

export default About;
 