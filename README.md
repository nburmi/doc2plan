[![ESLint check](https://github.com/nburmi/doc2plan/actions/workflows/eslint.yml/badge.svg)](https://github.com/nburmi/doc2plan/actions/workflows/eslint.yml)

# Learning Plan Creator and Viewer

This project is under development.

## Overview

This project is a browser-based application designed to create personalized and structured learning plans by extracting content from documents and allowing users to interactively go through their plan. It features two main components: the **Creator** and the **Viewer**.

### Creator

**Important note: AI sometimes hallucinates and generates incorrect information. Please verify the generated content before using it for learning purposes.**

The Creator allows users to either manually construct a learning plan or use AI to automate the process. The AI functionality can extract chapters and content from any book or document, providing a structured output that includes quizzes generated based on the content. This feature simplifies the creation of comprehensive learning modules tailored to the user's needs.

Follow this path to create a learning plan with AI assistance:

1. Upload a book (pdf, md, docx).
2. Extract chapters.
3. Select chapter and extract key topics and create topics.
4. Generate content for each topic.
5. Generate quiz for each topic.
6. Basically, you can come back to the creator and add more topics or chapters to the plan at any time.

<details>
  <summary>Demo creator</summary>
  
  ![demo_creator](./public/demo_creator.gif)
</details>

### Viewer

The Viewer presents a straightforward interface with a split-pane layout. The left sidebar displays chapters and topics, where users can track their progress by marking completed topics. The main pane on the right shows the content extracted from the book or document, facilitating easy access and study.

<details>
  <summary>Demo viewer</summary>
  
  ![demo_viewer](./public/demo_viewer.gif)
</details>

### Settings

The application includes a settings page where users can manage their OpenAI settings, including the API key, model, temperature, assistant ID, vector store ID, and file ID used for vector creation. This feature allows users to customize their AI-driven learning experience according to their preferences.

## Features

- **Fully Browser-Based**: Runs entirely in your browser, with all settings and plans stored locally.
- **AI-Driven Content Extraction**: Automatically extract chapters and key content from documents to build a learning plan.
- **Quiz Generation**: Generate quizzes (questions and answers) based on the content to aid in learning and retention.
- **Progress Tracking**: Easily mark topics as completed and visualize your progress through the learning plan.
- **Plan Import/Export**: Import and export your learning plans to and from JSON format for easy sharing and management.
- **Assistant Management**: Manage OpenAI settings and assistants, including creation, updating, and deletion of AI assistants as required.
- **Customizable Settings**: Manage OpenAI settings including API Key, model, temperature, assistant ID, vector store ID, and file ID used for vector creation.
- **Viewer Chat**: Interact with the AI assistant through a chat interface to ask questions and get answers related to the content.
- **Viewer Chat: Text to speech**: Support for converting text to speech, allowing users to listen to the content.
- **Viewer Chat: Speech to text**: Support for converting speech to text, enabling users to input content through voice.
- **Integrate with Various RAG(in plans)**: This feature allows you to connect and utilize different Retrieval-Augmented Generation (RAG) for content extraction and question generation. It's not limited to OpenAI's RAG Assistant, offering you the flexibility to choose the RAG that best suits your needs.


## Getting Started

### Prerequisites

To use this application, you only need a modern web browser.  
For the AI-driven features, you will need an OpenAI API key.

### Installation

For live demo navigate to [https://doc2plan.vercel.app](https://doc2plan.vercel.app).

### Configuration

Access the settings through the application interface to input and manage your OpenAI API settings.

## Contributing

Your contributions make this project thrive. Whether it's reporting bugs, suggesting features, or submitting code changes, every bit of help is greatly appreciated.

**Report Issues:** If you encounter any problems, please open an issue on our GitHub page.

**Feature Requests:** Have an idea? Share it with us by opening an issue.

**Pull Requests:** Want to make a direct impact? Fork the repository, make your changes, and submit a pull request.

We look forward to growing this project with the community's support and creativity!

## License

Distributed under the MIT License. See `LICENSE` for more information.
