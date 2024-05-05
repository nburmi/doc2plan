# Learning Plan Creator and Viewer

## Overview

This project is a browser-based application designed to create personalized and structured learning plans by extracting content from documents and allowing users to interactively go through their plan. It features two main components: the **Creator** and the **Viewer**.

### Creator

The Creator allows users to either manually construct a learning plan or use AI to automate the process. The AI functionality can extract chapters and content from any book or document, providing a structured output that includes quizzes generated based on the content. This feature simplifies the creation of comprehensive learning modules tailored to the user's needs.

### Viewer

The Viewer presents a straightforward interface with a split-pane layout. The left sidebar displays chapters and topics, where users can track their progress by marking completed topics. The main pane on the right shows the content extracted from the book or document, facilitating easy access and study.

## Features

- **Fully Browser-Based**: Runs entirely in your browser, with all settings and plans stored locally.
- **AI-Driven Content Extraction**: Automatically extract chapters and key content from documents to build a learning plan.
- **Quiz Generation**: Generate quizzes (questions and answers) based on the content to aid in learning and retention.
- **Progress Tracking**: Easily mark topics as completed and visualize your progress through the learning plan.
- **Plan Import/Export**: Import and export your learning plans to and from JSON format for easy sharing and management.
- **Assistant Management**: Manage OpenAI settings and assistants, including creation, updating, and deletion of AI assistants as required.
- **Customizable Settings**: Manage OpenAI settings including API Key, model, temperature, assistant ID, vector store ID, and file ID used for vector creation.

## Getting Started

### Prerequisites

To use this application, you only need a modern web browser.  
For the AI-driven features, you will need an OpenAI API key.

### Installation

No installation necessary! Just navigate to [insert your project's URL here] to start using the application.

### Configuration

Access the settings through the application interface to input and manage your OpenAI API settings.

## Contributing

Contributions are what make the open source community such an empowering platform for learning, inspiring, and creating. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.
