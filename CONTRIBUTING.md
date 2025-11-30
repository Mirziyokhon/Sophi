# 🤝 Contributing to Rusaldo

Thank you for your interest in contributing to Rusaldo! This document provides guidelines for contributing to the project.

## 🎯 Ways to Contribute

### 1. Report Bugs
- Use GitHub Issues
- Provide detailed description
- Include steps to reproduce
- Share error messages
- Specify your environment

### 2. Suggest Features
- Open a feature request
- Explain the use case
- Describe expected behavior
- Consider implementation complexity

### 3. Improve Documentation
- Fix typos and errors
- Add examples
- Clarify instructions
- Translate to other languages

### 4. Submit Code
- Fix bugs
- Add features
- Improve performance
- Enhance UI/UX

## 🔧 Development Setup

### Prerequisites
- Python 3.9+
- Git
- Tesseract OCR
- FFmpeg

### Setup Steps

```bash
# 1. Fork and clone
git clone https://github.com/yourusername/Rusaldo.git
cd Rusaldo

# 2. Create virtual environment
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment
cp .env.example .env
# Add your API keys to .env

# 5. Run verification
python verify_setup.py

# 6. Run the app
streamlit run app.py
```

## 📝 Code Style

### Python Style Guide
- Follow PEP 8
- Use type hints
- Write docstrings
- Keep functions focused
- Maximum line length: 100 characters

### Example

```python
def extract_text(file_path: str, max_words: int = 3000) -> tuple[str, int]:
    """
    Extract text from file and validate length.
    
    Args:
        file_path: Path to the file
        max_words: Maximum allowed word count
        
    Returns:
        Tuple of (extracted_text, word_count)
        
    Raises:
        ValueError: If content exceeds max_words
    """
    # Implementation
    pass
```

### Naming Conventions
- **Classes:** PascalCase (`TextExtractor`)
- **Functions:** snake_case (`extract_text`)
- **Constants:** UPPER_CASE (`MAX_CONTENT_LENGTH`)
- **Private:** _leading_underscore (`_internal_method`)

## 🌿 Git Workflow

### Branch Naming
- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation
- `refactor/description` - Code refactoring

### Commit Messages

Follow conventional commits:

```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

**Examples:**
```
feat(video): add custom duration option

fix(ocr): handle low-quality images gracefully

docs(readme): add installation troubleshooting section
```

### Pull Request Process

1. **Create Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Write code
   - Add tests
   - Update documentation

3. **Test Thoroughly**
   ```bash
   python verify_setup.py
   # Test your changes manually
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat(scope): description"
   ```

5. **Push to Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create Pull Request**
   - Clear title and description
   - Reference related issues
   - Add screenshots if UI changes
   - Request review

## ✅ Testing Guidelines

### Manual Testing Checklist

Before submitting PR, test:

- [ ] All existing features still work
- [ ] New feature works as expected
- [ ] Error handling is appropriate
- [ ] UI is responsive
- [ ] No console errors
- [ ] Documentation is updated

### Test Cases to Cover

1. **Content Input**
   - PDF upload
   - Image OCR
   - Web scraping
   - Text input

2. **Personalization**
   - Preset interests
   - Custom descriptions
   - Profile enhancement

3. **Video Generation**
   - All durations
   - Different content types
   - Error scenarios

4. **Edge Cases**
   - Empty input
   - Very long content
   - Invalid URLs
   - Corrupted files

## 📚 Documentation Standards

### Code Documentation

```python
class VideoGenerator:
    """
    Handle video generation and assembly.
    
    This class manages the complete video generation pipeline including
    voiceover generation, animation creation, and final assembly.
    
    Attributes:
        elevenlabs_key: API key for ElevenLabs TTS
        pika_key: API key for Pika Labs animation
        
    Example:
        >>> generator = VideoGenerator()
        >>> video_path = generator.generate_complete_video(
        ...     script="Learning content...",
        ...     visual_prompts=["Scene 1", "Scene 2"],
        ...     duration=60,
        ...     output_filename="video.mp4"
        ... )
    """
```

### README Updates

When adding features:
- Update feature list
- Add usage examples
- Update screenshots
- Mention in changelog

## 🐛 Bug Reports

### Good Bug Report Template

```markdown
**Description**
Clear description of the bug

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Screenshots**
If applicable

**Environment**
- OS: [e.g., Windows 11]
- Python: [e.g., 3.9.7]
- Browser: [e.g., Chrome 120]

**Error Messages**
```
Paste error messages here
```

**Additional Context**
Any other relevant information
```

## 💡 Feature Requests

### Good Feature Request Template

```markdown
**Feature Description**
Clear description of the feature

**Use Case**
Why is this feature needed?

**Proposed Solution**
How should it work?

**Alternatives Considered**
Other ways to achieve the same goal

**Additional Context**
Mockups, examples, references
```

## 🎨 UI/UX Guidelines

### Design Principles
- **Simplicity:** Keep it simple and intuitive
- **Consistency:** Follow existing patterns
- **Feedback:** Provide clear user feedback
- **Accessibility:** Consider all users

### Streamlit Best Practices
- Use appropriate widgets
- Provide helpful labels
- Show progress indicators
- Handle errors gracefully
- Maintain responsive layout

## 🔐 Security Guidelines

### Never Commit
- API keys
- Passwords
- Personal data
- Large binary files

### Always
- Use environment variables
- Validate user input
- Sanitize file uploads
- Handle errors securely

## 📦 Adding Dependencies

### Before Adding
- Is it really needed?
- Is it actively maintained?
- What's the license?
- What's the size?

### How to Add

1. Install package
   ```bash
   pip install package-name
   ```

2. Update requirements.txt
   ```bash
   pip freeze > requirements.txt
   ```

3. Document usage in code

4. Update SETUP.md if needed

## 🚀 Release Process

### Version Numbers
Follow Semantic Versioning (SemVer):
- **MAJOR:** Breaking changes
- **MINOR:** New features (backward compatible)
- **PATCH:** Bug fixes

### Release Checklist
- [ ] All tests pass
- [ ] Documentation updated
- [ ] CHANGELOG updated
- [ ] Version number bumped
- [ ] Git tag created
- [ ] Release notes written

## 🎓 Learning Resources

### Python
- [PEP 8 Style Guide](https://pep8.org/)
- [Python Type Hints](https://docs.python.org/3/library/typing.html)

### Streamlit
- [Streamlit Documentation](https://docs.streamlit.io/)
- [Streamlit Gallery](https://streamlit.io/gallery)

### AI/ML
- [OpenAI API Docs](https://platform.openai.com/docs)
- [LangChain Docs](https://python.langchain.com/)

### Video Processing
- [MoviePy Documentation](https://zulko.github.io/moviepy/)
- [FFmpeg Guide](https://ffmpeg.org/documentation.html)

## 💬 Communication

### Be Respectful
- Be kind and professional
- Welcome newcomers
- Provide constructive feedback
- Assume good intentions

### Ask Questions
- No question is too basic
- Search existing issues first
- Provide context
- Be patient

## 🏆 Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in documentation

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🙏 Thank You!

Every contribution, no matter how small, helps make Rusaldo better for everyone. We appreciate your time and effort!

---

**Questions?** Open an issue or reach out to the maintainers.

**Ready to contribute?** Check out [good first issues](https://github.com/yourusername/Rusaldo/labels/good%20first%20issue)!
