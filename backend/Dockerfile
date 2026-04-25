FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive
ENV PATH="/usr/local/go/bin:$PATH"

# Python 3.11 + GCC/G++ + GDB + OpenJDK
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3.11 python3.11-dev python3-pip \
    gcc g++ gdb \
    default-jdk \
    curl wget ca-certificates gnupg2 \
    && rm -rf /var/lib/apt/lists/*

# Node.js 20 + esbuild
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && npm install -g esbuild \
    && rm -rf /var/lib/apt/lists/*

# Go 1.22
RUN wget -q https://go.dev/dl/go1.22.4.linux-amd64.tar.gz \
    && tar -C /usr/local -xzf go1.22.4.linux-amd64.tar.gz \
    && rm go1.22.4.linux-amd64.tar.gz

# .NET SDK 8
RUN wget -q https://packages.microsoft.com/config/ubuntu/22.04/packages-microsoft-prod.deb \
    && dpkg -i packages-microsoft-prod.deb \
    && rm packages-microsoft-prod.deb \
    && apt-get update && apt-get install -y --no-install-recommends dotnet-sdk-8.0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt

# Pre-warm dotnet NuGet cache so first C# execution is fast
RUN mkdir /tmp/dotnet-warmup && cd /tmp/dotnet-warmup \
    && dotnet new console -o proj --force \
    && cd proj && dotnet build -c Release \
    && cd / && rm -rf /tmp/dotnet-warmup

COPY . .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
