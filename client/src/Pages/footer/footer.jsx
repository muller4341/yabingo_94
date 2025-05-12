import { Footer } from 'flowbite-react';
import { Link } from 'react-router-dom';
import { lottery } from '../../assets';
import { BsFacebook, BsInstagram, BsTwitter, BsGithub, BsDribbble } from 'react-icons/bs';
export default function FooterCom() {
  return (
    <Footer container className='border border-t-1 border-teal-100 bg-fuchsia-900'>
      <div className='w-full max-w-7xl mx-auto'>
        <div className='grid w-full justify-between sm:flex md:grid-cols-1'>
          <div className='mt-5'>
            
              <Link to='/' className='self-center whitespace-nowrap 
                              text-2xl sm:text-3xl font-semibold dark:text-white flex '>
                                
                                   
                                  <img src={lottery} alt='logo' className='w-10 h-10 md:h-12 md:h-12 inline' />
                                  
                                  <p className=' text-[16px] md:text-[18px] font-[cursive] italic tracking-wide ml-2 text-yellow-400'
                  style={{ fontFamily: 'Garamond, Georgia, serif' }}> Treasur Hunt</p>
                                  
                
                              </Link>
              
              
            
          </div>
          <div className='grid grid-cols-2 gap-8 mt-4 sm:grid-cols-3 sm:gap-6'>
            <div>
              <Footer.Title title='About'   className='text-yellow-400' />
              <Footer.LinkGroup col>
                <Footer.Link
                  href='https://github.com/muller4341'
                  target='_blank'
                  rel='noopener noreferrer'
                  className='text-yellow-400'
                >
                  Different Projects
                </Footer.Link>
                <Footer.Link
                  href='/about'
                  target='_blank'
                  rel='noopener noreferrer'
                    className='text-yellow-400'
                >
                  Treasur Hunt
                </Footer.Link>
              </Footer.LinkGroup>
            </div>
            <div>
              <Footer.Title title='Follow us'   className='text-yellow-400' />
              <Footer.LinkGroup col>
                <Footer.Link
                  href='https://github.com/muller4341'
                  target='_blank'
                  rel='noopener noreferrer'
                    className='text-yellow-400'
                >
                  Github
                </Footer.Link >
                <Footer.Link href='#'
                  className='text-yellow-400'>Discord</Footer.Link>
              </Footer.LinkGroup>
            </div>
            <div>
              <Footer.Title title='Legal'    className='text-yellow-400'/>
              <Footer.LinkGroup col>
                <Footer.Link href='#'
                  className='text-yellow-400'>Privacy Policy</Footer.Link>
                <Footer.Link href='#'
                  className='text-yellow-400'>Terms &amp; Conditions</Footer.Link>
              </Footer.LinkGroup>
            </div>
          </div>
        </div>
        <Footer.Divider />
        <div className='w-full sm:flex sm:items-center sm:justify-between'>
          <Footer.Copyright
            href='#'
            by="Mark value"
            year={new Date().getFullYear()}
              className='text-yellow-400'
          />
          <div className="flex gap-6 sm:mt-0 mt-4 sm:justify-center">
            <Footer.Icon href='https://web.facebook.com/login/identify/?ctx=not_my_account' icon={BsFacebook}
              className='text-yellow-400'/>
            <Footer.Icon href='#' icon={BsInstagram}   className='text-yellow-400'/>
            <Footer.Icon href='#' icon={BsTwitter}   className='text-yellow-400'/>
            <Footer.Icon href='https://github.com/muller4341' icon={BsGithub}   className='text-yellow-400'/>
            <Footer.Icon href='#' icon={BsDribbble}   className='text-yellow-400'/>

          </div>
        </div>
      </div>
    </Footer>
  );
}