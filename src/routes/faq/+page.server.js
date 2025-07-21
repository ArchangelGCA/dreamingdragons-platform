export async function load() {
	return {
		faqData: [
			{
				question: 'What is DreamingDragons?',
				answer: 'DreamingDragons is a platform for artists and writers to share their creations. We call these creations "Tales", which can be standalone artworks, books with multiple chapters, or a mix of both.',
				category: 'Platform',
				categoryColor: 'primary'
			},
			{
				question: 'What are "Tales" and "Chapters"?',
				answer: 'A "Tale" is the main container for your work. It can be a single piece of art, a comic, or a written story. "Chapters" are the individual parts of a Tale, such as parts of a story.',
				category: 'Content',
				categoryColor: 'info'
			},
			{
				question: 'How do I upload my work?',
				answer: 'Navigate to the "Upload" page. First, you create a "Tale" by giving it a title, image (or cover), description, and tags. Once the Tale is created, you can start adding "Chapters" to it. This is useful for making multi-part stories.',
				category: 'Upload',
				categoryColor: 'success'
			},
			{
				question: 'Can I edit my content after publishing?',
				answer: 'Yes, you can edit your Tales and Chapters at any time. Simply navigate to the content you wish to change and look for the edit options.',
				category: 'Editing',
				categoryColor: 'warning'
			},
			{
				question: 'What formatting options are available for text?',
				answer: 'We provide a rich text editor (based on TinyMCE) for writing your chapters. You can use various formatting options like bold, italics, lists, and more to style your text. You can even mention users with @username.',
				category: 'Editing',
				categoryColor: 'warning'
			},
			{
				question: 'What are the rules for content?',
				answer: 'We have a few important rules: <ul><li><strong>No AI-generated </strong> or <strong>Mature</strong> content is allowed. All work must be created by a human and be Safe-For-Work (SFW).</li><li>Content must adhere to our <a href="/legal/tos">Terms of Service</a>. This includes no hate speech, harassment, or illegal content.</li><li>Please respect copyright and only upload content you have created.</li></ul> For more details, please see our <a href="/legal/tos">Terms of Service</a>.',
				category: 'Rules',
				categoryColor: 'danger'
			},
			{
				question: 'Can I customize my profile?',
				answer: 'Yes! You can go to your profile page and edit it to add an avatar and a banner. You can also feature your favorite galleries or hide them from your "Settings".',
				category: 'Profile',
				categoryColor: 'secondary'
			},
			{
				question: 'How does the gallery feature work?',
				answer: 'You can create galleries to organize your Tales. This is useful if you have multiple stories, comics or series and want to group them together for your followers to easily find. Galleries will be visible on your profile.',
				category: 'Features',
				categoryColor: 'info'
			},
			{
				question: 'How do I use tags?',
				answer: 'Tags are keywords you can add to your Tales to help others discover them. Use relevant tags that describe your content, such as the genre, themes, or characters. This improves the visibility of your work in search results.',
				category: 'Features',
				categoryColor: 'info'
			},
			{
				question: 'Is there a way to interact with other users?',
				answer: 'Yes, you can follow other users to see their latest work on your feed. You can Favourite and share works. You can also comment on Tales and Chapters to leave feedback and interact with the community. You can also mention other users in comments and descriptions by using @username. Perhaps, you could even join our <a href="https://discord.com/invite/u6qFjfDDy2">Discord</a> server to chat with the community.',
				category: 'Community',
				categoryColor: 'primary'
			},
			{
				question: 'How can I find specific content or creators?',
				answer: 'You can use the search bar to look for Tales and users. You can search by title, tags, or username.',
				category: 'Search',
				categoryColor: 'info'
			},
			{
				question: 'How do I stay informed about platform updates?',
				answer: 'We post all platform changes and news on our <a href="/updates">Updates</a> page. You can also subscribe to our RSS feed to get the latest news or join our <a href="https://discord.com/invite/u6qFjfDDy2">Discord</a> server.',
				category: 'Updates',
				categoryColor: 'primary'
			},
			{
				question: 'Do you have RSS feeds?',
				answer: 'Yes, we have RSS feeds for platform updates, new content, and individual user profiles. Look for the RSS icon to subscribe.',
				category: 'Features',
				categoryColor: 'info'
			},
			{
				question: 'Can I embed my content on other websites?',
				answer: 'Yes, our platform supports the oEmbed standard, which allows you to easily embed your Tales and Chapters on other websites and platforms that support it, like Discord.',
				category: 'Features',
				categoryColor: 'info'
			},
			{
				question: 'Where can I find the legal information?',
				answer: 'You can find our <a href="/legal/tos">Terms of Service</a> and <a href="/legal/privacy-policy">Privacy Policy</a> in the "Legal" section of the site, linked in the footer.',
				category: 'Legal',
				categoryColor: 'secondary'
			},
			{
				question: 'How can I manage my account settings?',
				answer: 'You can change your account settings, including your password and email, on the <a href="/settings">Settings</a> page. This is also where you can manage your galleries and other site-related preferences.',
				category: 'Account',
				categoryColor: 'secondary'
			}
		]
	};
}
