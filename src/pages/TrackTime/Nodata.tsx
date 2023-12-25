interface NodataProps {
  image: string;
  message: string;
}

const Nodata = ({ image, message }: NodataProps) => {
  return (
    <div className="flex min-h-screen max-w-full flex-col items-center gap-4 rounded-lg border bg-slate-100 py-16 shadow-md">
      <img src={image} alt="no data" className="mx-auto w-1/3" />
      <span className="mr-8 self-end">
        Image by{" "}
        <a href="https://www.freepik.com/free-vector/flat-design-no-data-illustration_47718912.htm#query=not%20data&position=5&from_view=search&track=ais&uuid=7ee5c7a8-e536-4bdb-9331-39411353fc99">
          Freepik
        </a>
      </span>
      <div className="-mt-16 text-3xl">{message}</div>
    </div>
  );
};

export default Nodata;
