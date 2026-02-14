#!/bin/bash

sudo systemctl status postgresql
echo "Wyłączam PostgreSQL..."
sudo systemctl stop postgresql
sudo systemctl status postgresql
