from io import BytesIO

import matplotlib as mpl
import matplotlib.pyplot as plt


def generate_revenue_chart(data, title='Top 5 Products by Revenue') -> bytes:
    names = [d['product_name'] for d in data]
    revenues = [float(d['total_revenue']) for d in data if d['total_revenue'] is not None]
    print("REVENUES:", revenues)

    fig, ax = plt.subplots()

    norm = mpl.colors.Normalize(vmin=min(revenues), vmax=max(revenues))
    cmap = plt.get_cmap('plasma')
    colors = [cmap(norm(rev)) for rev in revenues]

    for idx, (name, revenue) in enumerate(zip(names, revenues)):
        ax.bar(name, revenue, color=colors[idx])

    ax.set_xlabel('Product')
    ax.set_ylabel('Revenue')
    ax.set_title(title)

    buf = BytesIO()
    fig.tight_layout()
    fig.savefig(buf, format='png')
    buf.seek(0)
    plt.close(fig)

    return buf.getvalue()


def generate_average_selling_price_chart(data):
    names = [d['category_name'] for d in data]
    prices = [float(d['total_revenue']) for d in data]

    fig, ax = plt.subplots()

    norm = mpl.colors.Normalize(vmin=min(prices), vmax=max(prices))
    cmap = plt.get_cmap('plasma')
    colors = [cmap(norm(price)) for price in prices]

    for idx, (name, price) in enumerate(zip(names, prices)):
        ax.bar(name, price, color=colors[idx])

    ax.set_xlabel('Category')
    ax.set_ylabel('Total Revenue')

    ax.set_xticks(range(len(names)))
    ax.set_xticklabels(names, rotation=45, ha='right')

    buf = BytesIO()
    fig.tight_layout()
    fig.savefig(buf, format='png')
    buf.seek(0)
    plt.close(fig)

    return buf.getvalue()

def generate_cashier_revenue_chart(data, title='Sales Revenue'):
    names = [d['full_name'] for d in data]
    revenues = [float(d['total_sales']) for d in data]

    fig, ax = plt.subplots()

    norm = mpl.colors.Normalize(vmin=min(revenues), vmax=max(revenues))
    cmap = plt.get_cmap('plasma')
    colors = [cmap(norm(rev)) for rev in revenues]

    for idx, (name, revenue) in enumerate(zip(names, revenues)):
        ax.bar(name, revenue, color=colors[idx])

    ax.set_xlabel('Employees')
    ax.set_ylabel('Total Revenue')
    ax.set_title(title)
    ax.set_xticks(range(len(names)))
    ax.set_xticklabels(names, rotation=45, ha='right')

    buf = BytesIO()
    fig.tight_layout()
    fig.savefig(buf, format='png')
    buf.seek(0)
    plt.close(fig)

    return buf.getvalue()
