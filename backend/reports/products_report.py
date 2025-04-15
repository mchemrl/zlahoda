from flask import Blueprint, render_template, request, send_file, make_response, current_app
from backend.services.products_service import fetch_products
from backend.decorators import login_required
import pdfkit
import os
import tempfile

products = Blueprint('product_reports', __name__)

