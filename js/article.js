document.addEventListener('DOMContentLoaded', () => {
    // 1. Parse URL to get slug
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get('slug');

    // 2. Fallback if no slug or slug not found
    if (!slug || !blogData[slug]) {
        window.location.href = 'blog.html';
        return;
    }

    const article = blogData[slug];

    // 3. Populate SEO & Meta Tags
    document.title = `${article.title} | Shaivika IT Solutions`;
    document.getElementById('meta-title').innerText = `${article.title} | Shaivika IT Solutions`;
    document.getElementById('meta-desc').setAttribute('content', article.seoDescription);

    document.getElementById('og-title').setAttribute('content', article.title);
    document.getElementById('og-desc').setAttribute('content', article.seoDescription);

    // 4. Populate Hero Section
    document.getElementById('hero-badge').innerText = article.heroBadge;
    document.getElementById('hero-title').innerText = article.title;
    document.getElementById('hero-subtitle').innerText = article.heroSubtitle;
    document.getElementById('hero-featured-image').innerText = article.featuredImage;

    // Tags
    const tagsContainer = document.getElementById('hero-tags');
    article.tags.forEach(tag => {
        const span = document.createElement('span');
        span.className = `tag ${tag.style}`;
        span.innerText = tag.name;
        tagsContainer.appendChild(span);
    });

    // Author & Meta
    document.getElementById('hero-avatar').innerText = article.author.avatar;
    document.getElementById('hero-author-name').innerText = article.author.name;
    document.getElementById('hero-date').innerText = article.date;
    document.getElementById('hero-read-time').innerText = article.readTime;

    // 5. Populate Article Body
    document.getElementById('article-main-content').innerHTML = article.content;

    // 6. Populate Project Showcase
    if (article.projectShowcase) {
        document.getElementById('showcase-title').innerText = article.projectShowcase.title;
        document.getElementById('showcase-desc').innerText = article.projectShowcase.description;

        const techGrid = document.getElementById('showcase-tech');
        article.projectShowcase.techStack.forEach(tech => {
            techGrid.innerHTML += `
                <div class="tech-card">
                    <strong>${tech.name}</strong>
                    <p style="font-size: 0.9em; margin: 0; color: var(--text-muted);">${tech.desc}</p>
                </div>
            `;
        });

        const featureList = document.getElementById('showcase-features');
        article.projectShowcase.features.forEach(feature => {
            featureList.innerHTML += `<li>${feature}</li>`;
        });
    } else {
        document.getElementById('showcase-section').style.display = 'none';
    }

    // 7. Populate Benefits
    if (article.benefits) {
        const benefitsContainer = document.getElementById('benefits-section');
        article.benefits.forEach(benefit => {
            benefitsContainer.innerHTML += `
                <div class="benefit-card">
                    <div class="benefit-icon">${benefit.icon}</div>
                    <h4>${benefit.title}</h4>
                    <p>${benefit.desc}</p>
                </div>
            `;
        });
    }

    // 8. Populate Client Attraction
    if (article.whyChooseUs) {
        const attractionList = document.getElementById('attraction-list');
        article.whyChooseUs.forEach(item => {
            attractionList.innerHTML += `<li>${item}</li>`;
        });
    }

    // 9. Show UI & Hide Loader
    document.getElementById('article-loader').style.display = 'none';
    document.getElementById('article-container').style.display = 'block';

    // 10. Populate Related Articles
    populateRelatedArticles(slug);

    // Initialize Scroll Animations for dynamically added items
    initRevealAnimations();
});

// Reading Progress Bar
window.addEventListener('scroll', () => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrolled = (winScroll / height) * 100;
    document.getElementById('reading-progress').style.width = scrolled + '%';
});

// Share Functions
function shareTo(platform) {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(document.title);

    if (platform === 'twitter') {
        window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
    } else if (platform === 'linkedin') {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
    } else if (platform === 'whatsapp') {
        window.open(`https://api.whatsapp.com/send?text=${text}%20-%20${url}`, '_blank');
    }
}

function copyLink() {
    navigator.clipboard.writeText(window.location.href);
    alert('Link copied to clipboard!');
}

// Exit Intent Popup Logic
let popupTriggered = false;

document.addEventListener('mouseleave', (e) => {
    if (e.clientY < 0 && !popupTriggered) {
        document.getElementById('exitPopup').classList.add('active');
        popupTriggered = true;
    }
});

document.getElementById('closePopup').addEventListener('click', () => {
    document.getElementById('exitPopup').classList.remove('active');
});

// Handle form submission for popup
document.getElementById('popupForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = e.target.querySelector('button');
    btn.innerText = 'Sending to your Email...';
    btn.disabled = true;

    setTimeout(() => {
        document.getElementById('exitPopup').innerHTML = `
            <div class="exit-popup">
                <div style="font-size: 60px; margin-bottom: 20px;">✅</div>
                <h3>Blueprint Sent!</h3>
                <p>Check your email inbox (and spam folder) in the next 5 minutes.</p>
                <button class="btn btn-ghost" onclick="document.getElementById('exitPopup').classList.remove('active')" style="margin-top: 20px;">Close Window</button>
            </div>
        `;
    }, 2000);
});

// Simple logic to show related articles
function populateRelatedArticles(currentSlug) {
    const container = document.getElementById('related-articles-container');
    const allSlugs = Object.keys(blogData).filter(s => s !== currentSlug);

    // If we only have 1 post right now, show hardcoded placeholders
    if (allSlugs.length === 0) {
        container.innerHTML = `
            <div class="blog-card" onclick="window.location.href='blog.html'">
                <div class="blog-thumb" style="background:linear-gradient(135deg,rgba(0,102,255,0.25),rgba(0,212,255,0.15));"><span>🌐</span></div>
                <div class="blog-content">
                    <div class="blog-meta"><span class="tag tag-blue" style="margin:0;">Web Dev</span><span>Feb 20, 2026</span></div>
                    <h3 class="blog-title">10 Frontend Performance Tricks That Will Make Your Website 3x Faster</h3>
                    <span class="read-more">Read More →</span>
                </div>
            </div>
            <div class="blog-card" onclick="window.location.href='blog.html'">
                <div class="blog-thumb" style="background:linear-gradient(135deg,rgba(0,245,212,0.2),rgba(0,102,255,0.2));"><span>☁️</span></div>
                <div class="blog-content">
                    <div class="blog-meta"><span class="tag tag-cyan" style="margin:0;">SaaS</span><span>Feb 15, 2026</span></div>
                    <h3 class="blog-title">How to Build a ₹1 Lakh/Month SaaS Business Starting From Zero</h3>
                    <span class="read-more">Read More →</span>
                </div>
            </div>
            <div class="blog-card" onclick="window.location.href='blog.html'">
                <div class="blog-thumb" style="background:linear-gradient(135deg,rgba(16,185,129,0.2),rgba(0,212,255,0.15));"><span>🚀</span></div>
                <div class="blog-content">
                    <div class="blog-meta"><span class="tag tag-green" style="margin:0;">Design</span><span>Feb 8, 2026</span></div>
                    <h3 class="blog-title">Why Dark Mode UI + Glassmorphism Is the Design Language of 2026</h3>
                    <span class="read-more">Read More →</span>
                </div>
            </div>
        `;
        return;
    }

    // Logic for actual related articles when more are added to blogData
    allSlugs.slice(0, 3).forEach(s => {
        const post = blogData[s];
        container.innerHTML += `
            <div class="blog-card" onclick="window.location.href='article.html?slug=${s}'">
                <div class="blog-thumb" style="background:linear-gradient(135deg,rgba(0,102,255,0.25),rgba(124,58,237,0.15));">
                    <span>${post.featuredImage || '📄'}</span>
                </div>
                <div class="blog-content">
                    <div class="blog-meta">
                        <span class="tag ${post.tags[0].style}" style="margin:0;">${post.tags[0].name}</span>
                        <span>${post.date}</span>
                    </div>
                    <h3 class="blog-title">${post.title}</h3>
                    <span class="read-more">Read More →</span>
                </div>
            </div>
        `;
    });
}

// Ensure scroll animations trigger for dynamically rendered items
function initRevealAnimations() {
    const reveals = document.querySelectorAll('.reveal');
    const wHeight = window.innerHeight;

    reveals.forEach(el => {
        const elementTop = el.getBoundingClientRect().top;
        if (elementTop < wHeight - 50) {
            el.classList.add('active');
        }
    });

    window.addEventListener('scroll', () => {
        reveals.forEach(el => {
            const elementTop = el.getBoundingClientRect().top;
            if (elementTop < wHeight - 50) {
                el.classList.add('active');
            }
        });
    });
}
