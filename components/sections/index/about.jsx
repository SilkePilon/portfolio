// Core packages
import Image from 'next/image'

// Section structure
import Section from '../../structure/section';
import Container from '../../structure/container';

// Section general blocks
import SectionTitle from '../../blocks/section.title.block'
import SectionGridBg from '../../blocks/section.grid.block'

// Section specific blocks
import BadgesBlock from '../../blocks/about.badges.block'
import CopyBlock from '../../blocks/about.copy.block'

// Section scss
import about from '../../../styles/sections/index/about.module.scss';

/**
 * Section: About
 * An overview of yourself.
 * Highlight your top level attributes and disciplines.
 * 
 * @returns {jsx} <About />
 */
export default function About() {
	return (
		<Section classProp={about.section}>	
			<Container spacing={['verticalXXXLrg']}>
				<SectionTitle
					title="About Me"
					preTitle="Synopsis"
					subTitle="With a diverse skill set that includes Python, JavaScript, HTML, UI design, full stack development, operational architecture, systems design, photography, I am a well-rounded digital professional."
				/>
				<section className={about.content}>
					<div className={about.image}>
						<img src="/img/main.jpeg" alt="Nelson family photo"/>
						{/* <Image src="/img/family-photo.jpg" width={600} height={800}/> */}
					</div>
					<div className={about.copy} >
						<CopyBlock 
							title="A bit about me"
							containerClass={about.container}
							iconClass={about.icon}
							icon={[ 'fat', 'ear-listen' ]}
							copy="I'm Silke Pilon, a student from the Netherlands with a passion for open source development. I've contributed to projects like MineFlayer and You.com using languages like Python and JavaScript, dabbling in AI and machine learning along the way."
						/>
						<BadgesBlock 
							title="When i'm not coding, I'm..." 
							containerClass={about.container}
							list={methods} 
							fullContainer="fullContainer"
							block="methods" 
							icon="planet-moon"
							copy="When I'm not coding, you can often find me outdoors with my camera, exploring nature and capturing it through photography. I love the creative outlet and being immersed in beautiful scenery."
							//invertedColor="invertedColor"
							headerIcon={`${about.icon}`}
						/>
					</div>
				</section>	
			</Container>
		</Section>
	)
}

const methods 	= [
	{ key: '', 	name: 'Photography', 		type: 'fad' },
	{ key: '', 	name: 'Raspberry Pi', 	type: 'fad' },
	{ key: '', 	name: 'ESP 32', 	type: 'fad' },
	{ key: '', 	name: '3D Printing', 	type: 'far' },
	{ key: '', 	name: 'VR & AR', 	type: 'fad' },
	{ key: '', 	name: 'DJ', 		type: 'fad' },
]