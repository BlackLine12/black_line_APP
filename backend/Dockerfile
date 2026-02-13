FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

ARG USER_ID=1000
ARG GROUP_ID=1000

RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    git \
    curl \
    zsh \
    vim \
    && rm -rf /var/lib/apt/lists/*

RUN groupadd -g ${GROUP_ID} appuser && \
    useradd -m -u ${USER_ID} -g appuser -s /bin/zsh appuser

USER appuser
WORKDIR /home/appuser

RUN sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)" "" --unattended

RUN git clone https://github.com/zsh-users/zsh-autosuggestions ~/.oh-my-zsh/custom/plugins/zsh-autosuggestions && \
    git clone https://github.com/zsh-users/zsh-syntax-highlighting.git ~/.oh-my-zsh/custom/plugins/zsh-syntax-highlighting

RUN sed -i 's/plugins=(git)/plugins=(git python zsh-autosuggestions zsh-syntax-highlighting)/' ~/.zshrc && \
    echo 'alias py="python"' >> ~/.zshrc

WORKDIR /app

COPY --chown=appuser:appuser requirements.txt .
RUN pip install --user --upgrade pip && \
    pip install --user -r requirements.txt

COPY --chown=appuser:appuser . .

EXPOSE 8000

CMD ["zsh"]
