FROM python:3.12


WORKDIR /app


RUN apt-get update && \
    apt-get install -y ghostscript && \
    rm -rf /var/lib/apt/lists/*


COPY requirements.txt .


RUN pip install -r requirements.txt


COPY . .


CMD ["uvicorn", "server:app", "--host", "0.0.0.0"]
