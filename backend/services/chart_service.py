import matplotlib.pyplot as plt
import matplotlib as mpl
from io import BytesIO

def generate_revenue_chart(data, title='Top 5 Products by Revenue') -> bytes:
    names = [d['product_name'] for d in data]
    revenues = [d['total_revenue'] for d in data]

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
