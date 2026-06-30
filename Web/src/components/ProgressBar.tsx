type Props = {
  current: number;
  total: number;
};

const ProgressBar = ({ current, total }: Props) => {
  const percent = (current / total) * 100;

  return (
    <div className="space-y-2">
      <p className="text-center font-medium">
        Card {current} of {total}
      </p>

      <div className="h-3 bg-gray-200 rounded-full">
        <div
          className="h-full bg-green-600 rounded-full"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;