import { Link } from "react-router-dom";

export type Recommendation = {
  id: number;
  image: string;
  title: string;
  desc: string;
};

type Props = { item: Recommendation };

export default function RecommendationItem({ item }: Props) {
  return (
    <li>
      <Link to={`/read/${item.id}`}>
        <div className="page__recommend-list">
          <img src={item.image} alt="" className="page__recommend-img" />
          <div>
            <h4 className="page__recommend-subtitle">{item.title}</h4>
            <p className="page__recommend-desc">{item.desc}</p>
          </div>
        </div>
      </Link>
    </li>
  );
}
